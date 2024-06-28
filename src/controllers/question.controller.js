import httpStatus from "http-status";
import questionService from "../services/question.service.js";
import catchAsync from "../utils/catchAsync.js";
import testService from "../services/test.service.js";

const createQuestion = catchAsync(async (req, res, next) => {
    const test = await testService.findById(req.params.testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test ID not found");
    }

    const { question, content } = await questionService.createQuestion(
        test._id,
        {
            ...req.body,
            content: {
                ...JSON.parse(req.body.content),
                images: req.files.map((f) => f.path),
            },
        }
    );
    return res.status(httpStatus.ACCEPTED).send({ question, content });
});

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

const validateQuestions = catchAsync(async (req, res, next) => {
    const validated = await questionService.validateQuestions(
        req.params.testId
    );
    return res.status(httpStatus.ACCEPTED).send({ validated });
});

export default {
    createQuestion,
    addAnswer,
    validateQuestions,
    updateQuestion,
};
