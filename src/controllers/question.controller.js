import httpStatus from "http-status";
import questionService from "../services/question.service.js";
import catchAsync from "../utils/catchAsync.js";

const updateQuestion = catchAsync(async (req, res, next) => {
    const { question, content } = await questionService.updateQuestion(
        req.params.questionId,
        req.body
    );
    return res.status(httpStatus.ACCEPTED).send({ question, content });
});

const addAnswer = catchAsync(async (req, res, next) => {
    const updated = await questionService.addAnswer(
        req.params.questionId,
        req.body
    );

    return res.status(httpStatus.ACCEPTED).send({ updated });
});

export default {
    updateQuestion,
    addAnswer
};
