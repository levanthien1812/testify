import httpStatus from "http-status";
import answerService from "../services/answer.service.js";
import catchAsync from "../utils/catchAsync.js";
import { ApiError } from "../utils/apiError.js";

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

    const answers = await answerService.getAnswersBySubmissionId(submissionId);

    return res.status(httpStatus.OK).send({ answers: answers });
});

export default { updateAnswer, getAnswers };
