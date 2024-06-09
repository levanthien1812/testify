import httpStatus from "http-status";
import answerService from "../services/answer.service.js";
import catchAsync from "../utils/catchAsync.js";

const createAnswers = catchAsync(async (req, res, next) => {
    const newAnswers = await answerService.createAnswers(
        req.user.id,
        req.body.answers
    );
    return res.status(httpStatus.CREATED).send({ answers: newAnswers });
});

export default { createAnswers };
