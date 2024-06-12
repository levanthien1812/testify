import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import questionService from "./question.service.js";
import { Question } from "../models/question.model.js";
import { User } from "../models/user.model.js";
import { Part } from "../models/part.model.js";
import { shareOptions } from "../config/shareOptions.js";
import { testStatus } from "../config/testStatus.js";

const createTest = async (testBody) => {
    const { datetime, duration, close_time } = testBody;

    if (
        close_time &&
        new Date(datetime).getTime() > new Date(close_time).getTime()
    ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid close time");
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

const getTest = async (testId, user) => {
    const test = await Test.findById(testId).populate("taker_ids");

    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "No test found with this ID");
    }

    if (user.role === "taker") {
        if (!test.taker_ids.map((taker) => taker.id).includes(user.id)) {
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
                    user
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
        questions = await questionService.getQuestionsContent(questions, user);

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
        testBody.shareOption &&
        testBody.shareOption === shareOptions.RESTRICTED
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

const updateTestStatus = async () => {
    const now = new Date();

    const tests = await Test.find({});

    tests.forEach(async (test) => {
        let status;
        if (test.shareOption) {
            status = testStatus.PUBLISHABLE;
        }

        if (new Date(test.datetime).getTime() - now.getTime() < 0) {
            status = testStatus.OPENED;
        }

        if (new Date(test.close_time).getTime() - now.getTime() < 0) {
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
    findById,
    getAvailableTakers,
    updateTestStatus,
};
