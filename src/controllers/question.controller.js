import httpStatus from "http-status";
import questionService from "../services/question.service.js";
import catchAsync from "../utils/catchAsync.js";
import testService from "../services/test.service.js";

const createQuestion = catchAsync(async (req, res, next) => {
    const test = await testService.findById(req.params.testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test ID not found");
    }

    const { question, content } = await questionService.createQuestion({
        ...req.body,
        test_id: test._id,
    });
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
    createQuestion,
    addAnswer,
};
