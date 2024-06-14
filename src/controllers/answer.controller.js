import httpStatus from "http-status";
import answerService from "../services/answer.service.js";
import catchAsync from "../utils/catchAsync.js";
import submissionService from "../services/submission.service.js";

const submitAnswers = catchAsync(async (req, res, next) => {
    const existingSubmission = await submissionService.getSubmissionByTakerId(
        req.user.id,
        req.params.testId
    );

    if (existingSubmission) {
        return next(httpStatus.BAD_REQUEST, "Test already submitted");
    }

    const newAnswers = await answerService.createAnswers(
        req.user.id,
        req.body.answers
    );

    const archivedScore = newAnswers.reduce(
        (acc, answer) => acc + answer.score,
        0
    );

    const totalCorrectAnswers = newAnswers.filter(
        (answer) => answer.is_correct
    );

    const totalWrongAnswers = newAnswers.filter((answer) => !answer.is_correct);

    const submission = await submissionService.createSubmission({
        taker_id: req.user.id,
        test_id: req.params.testId,
        score: archivedScore,
        correct_answers: totalCorrectAnswers.length,
        wrong_answers: totalWrongAnswers.length,
        start_time: new Date(req.body.startTime),
        submit_time: new Date(),
    });

    return res.status(httpStatus.CREATED).send({ answers: newAnswers });
});

export default { submitAnswers };
