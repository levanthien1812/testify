import httpStatus from "http-status";
import testService from "../services/test.service.js";
import catchAsync from "../utils/catchAsync.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import { ROLES } from "../config/constants/roles.js";
import questionService from "../services/question.service.js";
import partService from "../services/part.service.js";
import submissionService from "../services/submission.service.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";
import { ApiError } from "../utils/apiError.js";
import passcodeService from "../services/passcode.service.js";
import takerService from "../services/taker.service.js";
import makerService from "../services/maker.service.js";
import { Test } from "../models/test.model.js";
import { mockSubmissions } from "../seed/submission.seed.js";
import sendEmail from "../utils/sendEmail.js";
import { testAssignmentEmailTemplate } from "../templates/testAssignmentEmail.js";
import notificationService from "../services/notification.service.js";
import { NOTIFICATION_TYPES } from "../config/constants/notification.js";
import { toBool } from "../utils/boolean.js";

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
        { new: true },
    );

    return res.status(httpStatus.ACCEPTED).send({ test: updatedTest });
};

const publishTest = async (req, res, next) => {
    const test = await testService.publishTest(req.params.testId);
    const maker = await makerService.getMakerByUserId(req.user.id);

    if (test.notify_assignment && test.taker_ids.length > 0) {
        test.taker_ids.forEach(async (takerId) => {
            const taker = await takerService.getById(takerId);

            if (taker) {
                await sendEmail(
                    taker.user.email,
                    "Test Assignment",
                    testAssignmentEmailTemplate(
                        taker.user.name,
                        test.title,
                        `${process.env.CLIENT_URL}/tests/${test._id}`,
                        maker.user.name,
                    ),
                );
                const notification =
                    await notificationService.createNotification({
                        recipient_ids: [taker.user.id],
                        type: NOTIFICATION_TYPES.TEST_ASSIGNED,
                        message: `You have been assigned a new test: ${test.title}`,
                        link: `/tests/${test._id}`,
                        image: `${process.env.SERVER_URL}/images/added_to_test.png`,
                        metadata: {
                            testId: test._id,
                        },
                    });
            }
        });
    }

    return res.status(httpStatus.ACCEPTED).send({ test });
};

const getTests = catchAsync(async (req, res, next) => {
    const testsResult = await testService.getTests(req.user, req.query);

    return res.status(httpStatus.OK).send(testsResult);
});

const getTest = catchAsync(async (req, res, next) => {
    const { testId, takerId, code } = req.params;
    const { started, detailed } = req.query;

    let test = null;
    if (code) {
        const passcode = await passcodeService.findPasscodeByCode(code);
        test = await testService.getTestByPasscode(passcode.id);
    }

    if (testId) {
        test = await testService.getTest(testId, req.user, takerId);
    }

    let parts = [];
    let questions = [];
    let submissionsCount = 0;

    if (detailed === undefined || toBool(detailed)) {
        let options = {};
        if (req.user.role === ROLES.TAKER) {
            const taker = await takerService.getTakerByUserIdAndMakerId(
                req.user.id,
                test.maker_id,
            );

            const submissions =
                await submissionService.getSubmissionsByTakerIdAndTestId(
                    taker.id,
                    test.id,
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
                        new Date(test.public_answers_date).getTime() <
                        Date.now();
                }
            }

            await testService.addAccessedBy(test.id, taker.id);
        }

        options.includeContent = true;

        if (req.user.role === ROLES.MAKER) {
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
                parts = await partService.getPartsByParent(test.id, "test");
                parts = await Promise.all(
                    parts.map(async (part) => {
                        let questionsByPart =
                            await questionService.getQuestionsByPart(
                                part.id,
                                options,
                            );

                        return {
                            ...part.toObject(),
                            questions: questionsByPart,
                        };
                    }),
                );
            } else {
                questions = await questionService.getQuestionsByTestId(
                    test.id,
                    options,
                );
            }
        }
    }

    return res.status(httpStatus.OK).send({
        test: testService.filterFieldsByRole(test.toObject(), req.user.role),
        parts,
        questions,
        submissionsCount,
    });
});

const assignTakers = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const updatedTest = await testService.assignTakers(
        req.params.testId,
        req.body.taker_ids,
        req.body.notify_assignment,
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
        }),
    );

    const updatedTest = await testService.assignTakers(
        testId,
        newTakers.map((taker) => taker._id),
    );

    return res.status(httpStatus.ACCEPTED).send({ test: updatedTest });
});

const getTakersDetails = catchAsync(async (req, res, next) => {
    const { taker_ids } = req.body;
    const takers = await Promise.all(
        taker_ids.map(async (id) => {
            const taker = await takerService.getById(id);
            return taker;
        }),
    );

    return res.status(httpStatus.OK).send({ takers });
});

const getAvailableTakers = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const takers = await testService.getAvailableTakers(
        req.params.testId,
        maker.id,
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
        req.params.testId,
    );

    return res
        .status(httpStatus.OK)
        .send({ questions_result: questionsResult });
});

const getTestsToImportQuestionToBank = catchAsync(async (req, res, next) => {
    const tests = await testService.getTestsToImportQuestionToBank(req.user.id);

    return res.status(httpStatus.OK).send({ tests });
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
    getTestsToImportQuestionToBank,
};
