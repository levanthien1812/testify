import httpStatus from "http-status";
import testService from "../services/test.service.js";
import catchAsync from "../utils/catchAsync.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import { ROLES } from "../config/constants/roles.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { ERROR_CODE, ERROR_MESSAGE } from "../config/constants/errorCode.js";
import questionService from "../services/question.service.js";
import partService from "../services/part.service.js";
import submissionService from "../services/submission.service.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";
import { ApiError } from "../utils/apiError.js";
import passcodeService from "../services/passcode.service.js";
import takerService from "../services/taker.service.js";
import makerService from "../services/maker.service.js";
import { mockSubmissions } from "../seed/test.seed.js";
import { Test } from "../models/test.model.js";

const createTest = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);

    const body = {
        ...req.body,
        maker_id: maker.id,
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
    const { passcode, started } = req.query;

    const test = await testService.getTest(testId, req.user, takerId);

    let options = {};
    let parts = [];
    let questions = [];
    let submissionsCount = 0;

    if (req.user.role === ROLES.TAKER) {
        const taker = await takerService.getTakerByUserIdAndMakerId(
            req.user.id,
            test.maker_id
        );

        if (test.share_option === SHARE_OPTION.PASSCODE) {
            if (!passcode) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    ERROR_MESSAGE[ERROR_CODE.PASSCODE_REQUIRED],
                    ERROR_CODE.PASSCODE_REQUIRED
                );
            }

            const isCorrectPasscode = await passcodeService.checkPasscode(
                passcode,
                testId
            );
            if (!isCorrectPasscode) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    ERROR_MESSAGE[ERROR_CODE.INCORRECT_PASSCODE],
                    ERROR_CODE.INCORRECT_PASSCODE
                );
            }
        }

        if (
            test.share_option === SHARE_OPTION.RESTRICTED &&
            !test.taker_ids.includes(taker.id)
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

        const submissions =
            await submissionService.getSubmissionsByTakerIdAndTestId(
                taker.id,
                testId
            );
        submissionsCount = submissions.length;

        if (test.options.allow_show_maker_answers_after_test.enable) {
            if (
                test.options.allow_show_maker_answers_after_test
                    .public_answers_option ===
                PUBLIC_ANSWER_OPTION.AFTER_TAKER_SUBMISSION
            ) {
                options.includeCorrectAnswers = submissions.length > 0;
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
                options.includeCorrectAnswers =
                    new Date(test.public_answers_date).getTime() < Date.now();
            }
        }

        await testService.addAccessedBy(testId, taker.id);
    }

    if (req.user.role === ROLES.MAKER) {
        if (!testService.isTestBelongToUser(testId, req.user.id)) {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                ERROR_MESSAGE[ERROR_CODE.TEST_ACCESS_DENIED],
                ERROR_CODE.TEST_ACCESS_DENIED
            );
        }

        options.includeCorrectAnswers = true;
    }

    if (
        req.user.role === ROLES.TAKER &&
        !(test.status === TEST_STATUS.OPENED && started) &&
        !(
            (test.status === TEST_STATUS.OPENED ||
                test.status === TEST_STATUS.CLOSED) &&
            test.options.allow_view_submission_after_test.enable &&
            submissionsCount > 0
        )
    ) {
    } else {
        if (req.user.role === ROLES.TAKER) {
            if (test.options.allow_shuffle_questions.enable) {
                options.shuffleQuestions = true;
            }
            if (test.options.allow_shuffle_answers.enable) {
                options.shuffleAnswers = true;
            }
        }

        if (test.num_parts > 1) {
            parts = await partService.getPartsByTestId(testId);
            parts = await Promise.all(
                parts.map(async (part) => {
                    let questionsByPart =
                        await questionService.getQuestionsByPart(
                            part.id,
                            options
                        );
                    questionsByPart = await questionService.getQuestionsContent(
                        questionsByPart,
                        options
                    );

                    return { ...part.toObject(), questions: questionsByPart };
                })
            );
        } else {
            questions = await questionService.getQuestionsByTestId(
                testId,
                options
            );
            questions = await questionService.getQuestionsContent(
                questions,
                options
            );
        }
    }

    return res
        .status(httpStatus.OK)
        .send({ test, parts, questions, submissionsCount });
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
    const maker = await makerService.getMakerByUserId(req.user.id);
    const takersBody = req.body.takersBody.takers;

    const newTakers = await Promise.all(
        takersBody.map(async (takerBody) => {
            const newTaker = await takerService.createTaker({
                ...takerBody,
                maker_id: maker.id,
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
            const taker = await takerService.getById(id);
            return taker;
        })
    );

    return res.status(httpStatus.OK).send({ takers });
});

const getAvailableTakers = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const takers = await testService.getAvailableTakers(
        req.params.testId,
        maker.id
    );

    return res.status(httpStatus.OK).send({ takers: takers });
});

const mockTest = catchAsync(async (req, res, next) => {
    const test = await Test.findById(req.params.testId);

    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    await mockSubmissions(test.id);

    return res.status(httpStatus.CREATED).send("Mock test successfully!");
});

const getQuestionsResultForTest = catchAsync(async (req, res, next) => {
    const questionsResult = await testService.getQuestionsResultForTest(
        req.params.testId
    );

    return res
        .status(httpStatus.OK)
        .send({ questions_result: questionsResult });
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
    mockTest,
    getQuestionsResultForTest,
};
