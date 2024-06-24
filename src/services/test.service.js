import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import questionService from "./question.service.js";
import { Question } from "../models/question.model.js";
import { User } from "../models/user.model.js";
import { Part } from "../models/part.model.js";
import { shareOptions } from "../config/shareOptions.js";
import { testStatus } from "../config/testStatus.js";
import { publicAnswersOptions } from "../config/publicAnswerOptions.js";
import submissionService from "./submission.service.js";

const createTest = async (testBody) => {
    const { datetime, duration, close_time } = testBody;

    if (
        close_time &&
        new Date(datetime).getTime() > new Date(close_time).getTime()
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Close time must be after start time"
        );
    }

    const newTest = await Test.create(testBody);
    return newTest;
};

const getTests = async (filter, query) => {
    const tests = await Test.paginate(filter, query);

    const testsWithQuestions = await Promise.all(
        tests.results.map(async (test) => {
            const questions = await Question.find({ test_id: test.id });

            return { ...test.toObject(), questions };
        })
    );

    return testsWithQuestions;
};

const getTest = async (
    testId,
    user,
    withTakerAnswers = false,
    takerId = null
) => {
    const test = await Test.findById(testId)
        .populate({
            path: "taker_ids",
            select: "-__v -role -maker_id",
        })

    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "No test found with this ID");
    }

    let withCorrectAnswers = false;

    if (user.role === "taker") {
        if (
            test.share_option === shareOptions.RESTRICTED &&
            !test.taker_ids.map((taker) => taker.id).includes(user.id)
        ) {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                "You dont have access to this test!"
            );
        } else {
            if (new Date(test.datetime).getTime() - new Date().getTime() > 0) {
                return {
                    ...test.toObject(),
                    parts: [],
                    questions: [],
                };
            }
        }

        const submission = await submissionService.getSubmissionByTakerId(
            user._id,
            testId
        );

        if (!submission && withTakerAnswers) {
            return new ApiError(httpStatus.BAD_REQUEST, "No submission found");
        }

        if (
            test.public_answers_option ===
            publicAnswersOptions.AFTER_TAKER_SUBMISSION
        ) {
            withCorrectAnswers = !!submission;
        }

        if (
            (test.close_time &&
                test.public_answers_option ===
                    publicAnswersOptions.AFTER_CLOSE_TIME) ||
            test.public_answers_option === publicAnswersOptions.SPECIFIC_DATE
        ) {
            withCorrectAnswers =
                new Date(test.public_answers_date).getTime() < Date.now();
        }
    }

    if (user.role === "maker" && takerId) {
        const taker = await User.findById(takerId);
        if (!taker) {
            throw new ApiError(httpStatus.NOT_FOUND, "Taker not found");
        }
        withCorrectAnswers = true;
        withTakerAnswers = true;
    }

    let parts = await Part.find({ test_id: test.id });
    let questions;

    if (parts.length > 0) {
        parts = await Promise.all(
            parts.map(async (part) => {
                let questionsByPart = await questionService.getQuestionsByPart(
                    part.id
                );
                questionsByPart = await questionService.getQuestionsContent(
                    questionsByPart,
                    user,
                    withTakerAnswers,
                    withCorrectAnswers,
                    takerId
                );

                return { ...part.toObject(), questions: questionsByPart };
            })
        );

        return {
            ...test.toObject(),
            parts: parts,
        };
    } else {
        questions = await questionService.getQuestionsByTestId(testId);
        questions = await questionService.getQuestionsContent(
            questions,
            user,
            withTakerAnswers,
            withCorrectAnswers,
            takerId
        );

        return {
            ...test.toObject(),
            parts: [],
            questions: questions,
        };
    }
};

const assignTakers = async (testId, takerIds) => {
    const test = await Test.findById(testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    let notFoundTakerIds = [];
    takerIds.forEach(async (takerId) => {
        if (!(await User.find({ _id: takerId, role: "taker" }))) {
            notFoundTakerIds.push(takerId);
        }
    });

    takerIds = takerIds.filter((takerId) => {
        return !test.taker_ids.includes(takerId);
    });

    if (notFoundTakerIds.length > 0)
        return new ApiError(
            httpStatus.NOT_FOUND,
            `Takers with id ${notFoundTakerIds.join(", ")} not found`
        );

    if (takerIds.length === 0) return test;

    const updateTest = await Test.findByIdAndUpdate(
        testId,
        {
            $set: {
                taker_ids: [...test.taker_ids, ...takerIds],
            },
        },
        { new: true }
    );

    return updateTest;
};

const getAvailableTakers = async (testId, userId) => {
    const test = await Test.findById(testId);
    const addedTakerIds = test.taker_ids;
    const takers = await User.find({
        maker_id: userId,
        role: "taker",
        _id: { $nin: addedTakerIds },
    });

    return takers;
};

const updateTest = async (testId, testBody) => {
    const test = await Test.findById(testId);

    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    if (
        testBody.share_option &&
        testBody.share_option === shareOptions.ANYONE
    ) {
        testBody = {
            ...testBody,
            taker_ids: [],
        };
    }

    const updatedTest = await Test.findByIdAndUpdate(
        testId,
        { $set: testBody },
        {
            new: true,
        }
    );

    return updatedTest;
};

const publishTest = async (testId) => {
    const test = await Test.findById(testId);

    const updatedTest = await Test.findByIdAndUpdate(
        testId,
        { $set: { status: testStatus.PUBLISHED } },
        {
            new: true,
        }
    );

    return updatedTest;
};

const updateTestsStatus = async () => {
    const now = new Date();

    const tests = await Test.find({});

    tests.forEach(async (test) => {
        let status;
        if (test.status === testStatus.DRAFT && test.share_option) {
            status = testStatus.PUBLISHABLE;
        }

        if (
            test.status === testStatus.PUBLISHED &&
            new Date(test.datetime).getTime() - now.getTime() < 0
        ) {
            status = testStatus.OPENED;
        }

        if (
            test.status === testStatus.OPENED &&
            new Date(test.close_time).getTime() - now.getTime() < 0
        ) {
            status = testStatus.CLOSED;
        }

        await Test.findByIdAndUpdate(test.id, { $set: { status: status } });
    });
};

const findById = async (testId) => {
    const test = await Test.findById(testId);
    return test;
};

export default {
    createTest,
    getTests,
    getTest,
    assignTakers,
    updateTest,
    publishTest,
    findById,
    getAvailableTakers,
    updateTestsStatus,
};
