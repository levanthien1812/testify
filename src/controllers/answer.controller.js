import httpStatus from "http-status";
import answerService from "../services/answer.service.js";
import catchAsync from "../utils/catchAsync.js";
import { ApiError } from "../utils/apiError.js";
import { ROLES } from "../config/constants/roles.js";
import submissionService from "../services/submission.service.js";
import testService from "../services/test.service.js";

const updateAnswer = catchAsync(async (req, res, next) => {
    const updatedAnswer = await answerService.updateAnswer(
        req.params.answerId,
        req.body
    );

    return res.status(httpStatus.ACCEPTED).send({ answer: updatedAnswer });
});

const getAnswers = catchAsync(async (req, res, next) => {
    const submissionId = req.params.submissionId;
    if (!submissionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "SubmissionId is required");
    }

    const submission = await submissionService.findById(submissionId);
    const test = await testService.findById(submission.test_id);

    const answers = await answerService.getAnswersBySubmissionId(submissionId, {
        excludeScore:
            req.user.role === ROLES.TAKER &&
            !test.options.allow_show_maker_answers_after_test.enable,
    });

    return res.status(httpStatus.OK).send({ answers: answers });
});

export default { updateAnswer, getAnswers };
