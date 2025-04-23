import httpStatus from "http-status";
import testService from "../services/test.service.js";
import catchAsync from "../utils/catchAsync.js";
import userService from "../services/user.service.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import { ROLES } from "../config/constants/roles.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { ERROR_CODE, ERROR_MESSAGE } from "../config/constants/errorCode.js";
import { Part } from "../models/part.model.js";
import questionService from "../services/question.service.js";
import partService from "../services/part.service.js";
import submissionService from "../services/submission.service.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";
import { ApiError } from "../utils/apiError.js";

const createTest = catchAsync(async (req, res, next) => {
    const body = {
        ...req.body,
        maker_id: req.user.id,
        status: TEST_STATUS.DRAFT,
    };
    const test = await testService.createTest(body);

    return res
        .status(httpStatus.CREATED)
        .send({ test: { ...test.toObject() } });
});

const updateTest = async (req, res, next) => {
    const updatedTest = await testService.updateTest(
        req.params.testId,
        req.body,
        { new: true }
    );

    return res.status(httpStatus.ACCEPTED).send({ test: updatedTest });
};

const publishTest = async (req, res, next) => {
    const updatedTest = await testService.publishTest(req.params.testId);

    return res.status(httpStatus.ACCEPTED).send({ test: updatedTest });
};

const getTests = catchAsync(async (req, res, next) => {
    const testsResult = await testService.getTests(req.user, req.query);

    return res.status(httpStatus.OK).send(testsResult);
});

const getTest = catchAsync(async (req, res, next) => {
    const { testId, takerId } = req.params;

    const test = await testService.getTest(testId, req.user, takerId);

    // Determine if correct answers are returned or not
    let includeCorrectAnswers = false;
    let parts = [];
    let questions = [];

    if (req.user.role === ROLES.TAKER) {
        if (test.share_option === SHARE_OPTION.PASSCODE) {
            if (!req.query.passcode) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    ERROR_MESSAGE[ERROR_CODE.PASSCODE_REQUIRED],
                    ERROR_CODE.PASSCODE_REQUIRED
                );
            }
        }

        if (
            test.share_option === SHARE_OPTION.RESTRICTED &&
            !test.taker_ids.map((taker) => taker.id).includes(user.id)
        ) {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                ERROR_MESSAGE[ERROR_CODE.TEST_ACCESS_DENIED],
                ERROR_CODE.TEST_ACCESS_DENIED
            );
        }

        if (
            test.status === TEST_STATUS.PUBLISHABLE ||
            test.status === TEST_STATUS.DRAFT
        ) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                ERROR_MESSAGE[ERROR_CODE.TEST_NOT_AVAILABLE],
                ERROR_CODE.TEST_NOT_AVAILABLE
            );
        }

        if (test.status === TEST_STATUS.CLOSED) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                ERROR_MESSAGE[ERROR_CODE.TEST_CLOSED],
                ERROR_CODE.TEST_CLOSED
            );
        }

        if (test.status === TEST_STATUS.PUBLISHED) {
            return test;
        }

        if (test.options.allow_show_maker_answers_after_test.enable) {
            if (
                test.options.allow_show_maker_answers_after_test
                    .public_answers_option ===
                PUBLIC_ANSWER_OPTION.AFTER_TAKER_SUBMISSION
            ) {
                const submissions =
                    await submissionService.getSubmissionsByTakerId(
                        req.req.user._id,
                        testId
                    );
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

    if (req.user.role === ROLES.MAKER && takerId) {
        includeCorrectAnswers = true;
    }

    if (test.num_parts > 0) {
        parts = await partService.getPartsByTestId(testId);
        parts = await Promise.all(
            parts.map(async (part) => {
                let questionsByPart = await questionService.getQuestionsByPart(
                    part.id
                );
                questionsByPart = await questionService.getQuestionsContent(
                    questionsByPart,
                    includeCorrectAnswers
                );

                return { ...part.toObject(), questions: questionsByPart };
            })
        );
    } else {
        questions = await questionService.getQuestionsByTestId(testId);
        questions = await questionService.getQuestionsContent(
            questions,
            includeCorrectAnswers
        );
    }

    return res.status(httpStatus.OK).send({ test, parts, questions });
});

const assignTakers = catchAsync(async (req, res, next) => {
    const updatedTest = await testService.assignTakers(
        req.params.testId,
        req.body.taker_ids
    );

    return res.status(httpStatus.ACCEPTED).send({ updatedTest });
});

const createTakers = catchAsync(async (req, res, next) => {
    const { testId } = req.params;
    const user = req.user;
    const takersBody = req.body.takersBody.takers;

    const newTakers = await Promise.all(
        takersBody.map(async (takerBody) => {
            const newTaker = await userService.createUser({
                ...takerBody,
                maker_id: user._id,
                role: ROLES.TAKER,
            });

            return newTaker;
        })
    );

    const updatedTest = await testService.assignTakers(
        testId,
        newTakers.map((taker) => taker._id)
    );

    return res.status(httpStatus.ACCEPTED).send({ test: updatedTest });
});

const getTakersDetails = catchAsync(async (req, res, next) => {
    const { taker_ids } = req.body;
    const takers = await Promise.all(
        taker_ids.map(async (id) => {
            const taker = await userService.getUserById(id);
            return taker;
        })
    );

    return res.status(httpStatus.OK).send({ takers });
});

const getAvailableTakers = catchAsync(async (req, res, next) => {
    const takers = await testService.getAvailableTakers(
        req.params.testId,
        req.user._id
    );

    return res.status(httpStatus.OK).send({ takers: takers });
});

export default {
    createTest,
    getTests,
    getTest,
    assignTakers,
    updateTest,
    publishTest,
    createTakers,
    getAvailableTakers,
    getTakersDetails,
};
