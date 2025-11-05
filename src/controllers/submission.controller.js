import httpStatus from "http-status";
import testService from "../services/test.service.js";
import { ApiError } from "../utils/apiError.js";
import catchAsync from "../utils/catchAsync.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import submissionService from "../services/submission.service.js";
import answerService from "../services/answer.service.js";
import { ROLES } from "../config/constants/roles.js";
import takerService from "../services/taker.service.js";
import notificationService from "../services/notification.service.js";
import makerService from "../services/maker.service.js";
import { NOTIFICATION_TYPES } from "../config/constants/notification.js";
import { shorten } from "../utils/text.js";

const createSubmission = catchAsync(async (req, res, next) => {
    const test = await testService.findById(req.params.testId);
    const taker = await takerService.getTakerByUserIdAndMakerId(
        req.user.id,
        test.maker_id
    );

    const existingSubmissions =
        await submissionService.getSubmissionsByTakerIdAndTestId(
            taker.id,
            test.id,
            req.user.role
        );

    if (test.options.allow_multiple_submissions.enable) {
        if (
            existingSubmissions.length >=
            test.options.allow_multiple_submissions.maximum_submissions
        )
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Maximum submissions reached"
            );
    } else {
        if (existingSubmissions.length > 0) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Test already submitted"
            );
        }
    }

    if (
        test.close_time &&
        new Date(test.close_time).getTime() + test.duration * 60 * 1000 <
            Date.now()
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Test closed for submissions"
        );
    }

    // Mock submission
    // let submission = {
    //     taker_id: taker.id,
    //     test_id: req.params.testId,
    //     submit_time: new Date(),
    //     start_time: new Date(req.body.startTime),
    // };

    let submission = await submissionService.createSubmission({
        taker_id: taker.id,
        test_id: req.params.testId,
        submit_time: new Date(),
        start_time: new Date(req.body.startTime),
    });

    let newAnswers = await answerService.createAnswers(
        submission.id,
        req.body.answers
    );

    if (test.options.allow_shuffle_questions.enable) {
        await submissionService.updateSubmission(submission.id, {
            shuffled_questions: newAnswers.map((answer) => answer.question_id),
        });
    }

    if (test.are_answers_provided) {
        await submissionService.scoreSubmission(submission);
    }

    if (
        !test.options.allow_view_submission_after_test.enable ||
        !test.options.allow_show_maker_answers_after_test.enable
    ) {
        newAnswers = null;
    }

    // Create and send notification
    const maker = await makerService.getById(test.maker_id);
    let notification;

    const existingNotification = await notificationService.getNotification(
        maker.user_id,
        {
            type: NOTIFICATION_TYPES.TEST_SUBMISSION,
            "metadata.test_id": test.id.toString(),
        }
    );

    if (existingNotification) {
        const submissionsCount = await submissionService.getSubmissionsCount(
            test.id
        );

        if (submissionsCount > 1) {
            notification = await notificationService.updateNotification(
                existingNotification.id,
                {
                    message: `<strong>${taker.name}</strong> and ${
                        submissionsCount - 1
                    } others submitted for test <strong>${shorten(
                        test.title,
                        30
                    )}</strong>.`,
                }
            );
        }
    } else {
        notification = await notificationService.createNotification({
            sender_id: req.user.id,
            recipient_ids: [maker.user_id],
            type: NOTIFICATION_TYPES.TEST_SUBMISSION,
            message: `<strong>${
                taker.name
            }</strong> submitted for test <strong>${shorten(
                test.title,
                30
            )}</strong>`,
            link: `/tests/${test.id}`,
            metadata: {
                test_id: test.id,
            },
        });
    }

    await notificationService.sendNotification(notification);

    return res
        .status(httpStatus.CREATED)
        .send({ submission, answers: newAnswers });
});

const getSubmission = catchAsync(async (req, res, next) => {
    const submission = await submissionService.getSubmissionByTakerId(
        req.user.id,
        req.params.testId
    );

    return res.status(httpStatus.OK).send({ submission });
});

const getSubmissions = catchAsync(async (req, res, next) => {
    const test = await testService.findById(req.params.testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found!");
    }

    if (req.user.role === ROLES.TAKER) {
        if (![TEST_STATUS.OPENED, TEST_STATUS.CLOSED].includes(test.status)) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Test is not opened yet!"
            );
        }
        if (test.options.allow_view_submission_after_test.enable === false) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "You are not allowed to view submissions after test"
            );
        }
    }

    let submissions;
    if (req.user.role === ROLES.MAKER) {
        submissions = await submissionService.getSubmissionsByTestId(
            req.params.testId
        );
    } else {
        const taker = await takerService.getTakerByUserIdAndMakerId(
            req.user.id,
            test.maker_id
        );
        submissions = await submissionService.getSubmissionsByTakerIdAndTestId(
            taker.id,
            req.params.testId,
            taker.role
        );
    }

    const scores = await submissionService.calculateScores(req.params.testId);
    const rates = await submissionService.calculateRates(req.params.testId);

    return res.status(httpStatus.OK).send({
        submissions,
        total_submissions: submissions.length,
        ...scores,
        ...rates,
    });
});

const updateSubmission = catchAsync(async (req, res, next) => {
    const submission = await submissionService.updateSubmission(
        req.params.submissionId,
        req.body
    );
    return res.status(httpStatus.OK).send({ submission });
});

export default {
    createSubmission,
    getSubmission,
    getSubmissions,
    updateSubmission,
};
