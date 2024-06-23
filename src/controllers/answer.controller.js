import httpStatus from "http-status";
import answerService from "../services/answer.service.js";
import catchAsync from "../utils/catchAsync.js";

const updateAnswer = catchAsync(async (req, res, next) => {
    const updatedAnswer = await answerService.updateAnswer(
        req.params.answerId,
        req.body
    );

    return res.status(httpStatus.ACCEPTED).send({ answer: updatedAnswer });
});

export default { updateAnswer };
