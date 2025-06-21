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
        test_id: req.params.testId,
    });

    await testService.updateIncludingManuallyQuestions(test.id);

    return res.status(httpStatus.ACCEPTED).send({ question, content });
});

const updateQuestion = catchAsync(async (req, res, next) => {
    const { question, content } = await questionService.updateQuestion(
        req.params.questionId,
        {
            ...req.body,
        }
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

const validateQuestions = catchAsync(async (req, res, next) => {
    const validated = await questionService.validateQuestions(
        req.params.testId
    );
    return res.status(httpStatus.ACCEPTED).send({ validated });
});

const deleteQuestion = catchAsync(async (req, res, next) => {
    const question = await questionService.deleteQuestion(
        req.params.questionId,
        req.params.testId,
        req.body
    );

    return res.status(httpStatus.OK).send({ deleted: true });
});

const reorderQuestions = catchAsync(async (req, res, next) => {
    const reordered = await questionService.reorderQuestions(
        req.params.testId,
        req.body
    );

    return res.status(httpStatus.ACCEPTED).send({ reordered });
});

export default {
    createQuestion,
    addAnswer,
    validateQuestions,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
};
