import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import questionService from "./question.service.js";
import { Question } from "../models/question.model.js";
import { User } from "../models/user.model.js";
import { Part } from "../models/part.model.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";
import submissionService from "./submission.service.js";
import { Submission } from "../models/submission.model.js";
import { ROLES } from "../config/constants/roles.js";
import { ERROR_CODE, ERROR_MESSAGE } from "../config/constants/errorCode.js";

const createTest = async (testBody) => {
    const { datetime, enable_close_time, close_time } = testBody;

    if (
        enable_close_time &&
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

const getTests = async (user, reqQuery) => {
    const filter =
        user.role === ROLES.MAKER
            ? { maker_id: user.id }
            : { taker_ids: user.id };
    const query = {};

    if (user.role === ROLES.TAKER) {
        filter.status = { $in: [TEST_STATUS.OPENED, TEST_STATUS.CLOSED] };
    }

    reqQuery.date_from &&
        (filter.datetime = {
            $gte: new Date(reqQuery.date_from).toISOString(),
        });
    reqQuery.date_to &&
        (filter.datetime = {
            ...filter.datetime,
            $lte: new Date(reqQuery.date_to).toISOString(),
        });
    reqQuery.search &&
        (filter.title = { $regex: new RegExp(reqQuery.search, "i") });
    reqQuery.status && (filter.status = reqQuery.status);

    reqQuery.sort && (query.sortBy = reqQuery.sort);
    reqQuery.page && (query.page = reqQuery.page);
    reqQuery.limit && (query.limit = reqQuery.limit);

    const { results: tests, ...rest } = await Test.paginate(filter, query);

    const testsWithAddittionalData = await Promise.all(
        tests.map(async (test) => {
            const submissionsCount = await Submission.countDocuments({
                test_id: test._id,
            });

            return {
                ...test.toObject(),
                submissions_count: submissionsCount,
            };
        })
    );

    return { tests: testsWithAddittionalData, ...rest };
};

const getTest = async (
    testId,
    user,
    includeTakerAnswers = false,
    takerId = null
) => {
    const test = await Test.findById(testId);

    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "No test found with this ID");
    }

    // Determine if correct answers are returned or not
    let includeCorrectAnswers = false;

    if (user.role === ROLES.TAKER) {
        if (
            test.share_option === SHARE_OPTION.RESTRICTED &&
            !test.taker_ids.map((taker) => taker.id).includes(user.id)
        ) {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                ERROR_MESSAGE.ERR001,
                ERROR_CODE.ERR001
            );
        }

        if (
            test.status === TEST_STATUS.PUBLISHABLE ||
            test.status === TEST_STATUS.DRAFT
        ) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                ERROR_MESSAGE.ERR002,
                ERROR_CODE.ERR002
            );
        }

        if (test.status === TEST_STATUS.CLOSED) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                ERROR_MESSAGE.ERR003,
                ERROR_CODE.ERR003
            );
        }

        if (test.status === TEST_STATUS.PUBLISHED) {
            return {
                ...test.toObject(),
                parts: [],
                questions: [],
            };
        }

        const submissions = await submissionService.getSubmissionsByTakerId(
            user._id,
            testId
        );

        if (submissions.length === 0 && includeTakerAnswers) {
            return new ApiError(httpStatus.BAD_REQUEST, "No submission found");
        }

        if (test.options.allow_show_maker_answers_after_test.enable) {
            if (
                test.options.allow_show_maker_answers_after_test
                    .public_answers_option ===
                PUBLIC_ANSWER_OPTION.AFTER_TAKER_SUBMISSION
            ) {
                includeCorrectAnswers = submissions.length > 0;
            }

            if (
                (test.options.allow_show_maker_answers_after_test
                    .public_answers_option ===
                    PUBLIC_ANSWER_OPTION.AFTER_CLOSE_TIME &&
                    test.options.allow_close_time.enable &&
                    test.options.allow_close_time.close_time) ||
                test.options.allow_show_maker_answers_after_test
                    .public_answers_option ===
                    PUBLIC_ANSWER_OPTION.SPECIFIC_DATE
            ) {
                includeCorrectAnswers =
                    new Date(test.public_answers_date).getTime() < Date.now();
            }
        }
    }

    if (user.role === ROLES.MAKER && takerId) {
        includeCorrectAnswers = true;
        includeTakerAnswers = true;
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
                    includeCorrectAnswers,
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
            includeCorrectAnswers,
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
        if (!(await User.find({ _id: takerId, role: ROLES.TAKER }))) {
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
        maker_ids: userId,
        role: ROLES.TAKER,
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
        testBody.share_option === SHARE_OPTION.ANYONE
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
        { $set: { status: TEST_STATUS.PUBLISHED } },
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
        if (test.status === TEST_STATUS.DRAFT && test.share_option) {
            status = TEST_STATUS.PUBLISHABLE;
        }

        if (
            test.status === TEST_STATUS.PUBLISHED &&
            new Date(test.datetime).getTime() - now.getTime() < 0
        ) {
            status = TEST_STATUS.OPENED;
        }

        if (
            test.status === TEST_STATUS.OPENED &&
            new Date(test.close_time).getTime() - now.getTime() < 0
        ) {
            status = TEST_STATUS.CLOSED;
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
