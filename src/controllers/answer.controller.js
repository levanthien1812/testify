import httpStatus from "http-status";
import answerService from "../services/answer.service.js";
import catchAsync from "../utils/catchAsync.js";

const saveAnswer = catchAsync(async (req, res, next) => {
    const newAnswer = await answerService.saveAnswer(
        req.user.id,
        req.params.questionId,
        req.body
    );
    return res.status(httpStatus.CREATED).send({ answer: newAnswer });
});

export default { saveAnswer };
