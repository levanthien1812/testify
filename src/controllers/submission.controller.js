import httpStatus from "http-status";
import testService from "../services/test.service.js";
import { ApiError } from "../utils/apiError.js";
import catchAsync from "../utils/catchAsync.js";
import { testStatus } from "../config/testStatus.js";
import submissionService from "../services/submission.service.js";
import { Test } from "../models/test.model.js";
import answerService from "../services/answer.service.js";

const createSubmission = catchAsync(async (req, res, next) => {
    const existingSubmission = await submissionService.getSubmissionByTakerId(
        req.user.id,
        req.params.testId
    );

    if (existingSubmission) {
        return new ApiError(httpStatus.BAD_REQUEST, "Test already submitted");
    }

    const test = await Test.findById(req.params.testId);

    if (
        test.close_time &&
        new Date(test.close_time).getTime() + test.duration * 60 * 1000 <
            Date.now()
    ) {
        return new ApiError(
            httpStatus.BAD_REQUEST,
            "Test closed for submissions"
        );
    }

    let submission = await submissionService.createSubmission({
        taker_id: req.user._id,
        test_id: req.params.testId,
        submit_time: new Date(),
        start_time: new Date(req.body.startTime),
        wrong_answers: 0,
        correct_answers: 0,
        score: 0,
    });

    const newAnswers = await answerService.createAnswers(
        submission.id,
        req.body.answers
    );

    submission = await submissionService.scoreSubmission(submission.id);

    return res
        .status(httpStatus.CREATED)
        .send({ submission, answers: newAnswers });
});

const getSubmission = catchAsync(async (req, res, next) => {
    const submission = await submissionService.getSubmissionByTakerId(
        req.user._id,
        req.params.testId
    );

    return res.status(httpStatus.OK).send({ submission });
});

const getSubmissions = catchAsync(async (req, res, next) => {
    const test = await testService.findById(req.params.testId);
    if (!test) {
        return new ApiError(httpStatus.NOT_FOUND, "Test not found!");
    }

    if (![testStatus.OPENED, testStatus.CLOSED].includes(test.status)) {
        return new ApiError(httpStatus.NOT_FOUND, "Test is not opened yet!");
    }

    const submissions = await submissionService.getSubmissionsByTestId(
        req.params.testId
    );

    return res.status(httpStatus.OK).send({ submissions });
});

export default { createSubmission, getSubmission, getSubmissions };
