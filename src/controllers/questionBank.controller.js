import httpStatus from "http-status";
import questionBankService from "../services/questionBank.service.js";
import catchAsync from "../utils/catchAsync.js";
import questionService from "../services/question.service.js";
import makerService from "../services/maker.service.js";

const createQuestionBank = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const body = { ...req.body, maker_id: maker.id, created_at: new Date() };
    const questionBank = await questionBankService.createQuestionBank(body);
    return res.status(httpStatus.CREATED).send(questionBank);
});

const getQuestionBanks = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const questionBanks = await questionBankService.getQuestionBanksByMakerId(
        maker.id
    );
    return res.status(httpStatus.OK).send({ questionBanks });
});

const createQuestionInBank = catchAsync(async (req, res, next) => {
    const questionBankId = req.params.id;
    const body = req.body;
    const question = await questionBankService.createQuestionInBank(body);
    if (question) {
        await questionBankService.addQuestionsToBank(questionBankId, [
            question.question.id,
        ]);
    }
    return res.status(httpStatus.CREATED).send(question);
});

const updateQuestionInBank = catchAsync(async (req, res, next) => {
    const questionBankId = req.params.id;
    const questionId = req.params.questionId;
    const body = req.body;
    const question = await questionService.updateQuestion(questionId, body);

    return res.status(httpStatus.OK).send({ question });
});

const updateQuestionBank = catchAsync(async (req, res, next) => {
    const questionBankId = req.params.id;
    const body = req.body;
    const questionBank = await questionBankService.updateQuestionBank(
        questionBankId,
        body
    );
    return res.status(httpStatus.OK).send(questionBank);
});

const getQuestionBank = catchAsync(async (req, res, next) => {
    const questionBankId = req.params.id;
    const questionBank =
        await questionBankService.getQuestionBankByIdWithQuestions(
            questionBankId
        );
    return res.status(httpStatus.OK).send({ questionBank });
});

const importQuestionToBank = catchAsync(async (req, res, next) => {
    const questionBankId = req.params.id;
    const questions = req.body.questions;
    const updatedBank = await questionBankService.addQuestionsToBank(
        questionBankId,
        questions
    );
    return res.status(httpStatus.OK).send({ questionBank: updatedBank });
});

const deleteQuestionBank = catchAsync(async (req, res, next) => {
    const questionBankId = req.params.id;
    const questionBank = await questionBankService.getQuestionBankById(
        questionBankId
    );
    if (questionBank && questionBank.questions.length > 0) {
        await Promise.all(
            questionBank.questions.map(async (questionId) => {
                await questionService.deleteQuestionById(questionId);
            })
        );
    }
    const deleted = await questionBankService.deleteQuestionBank(
        questionBankId
    );
    return res.status(httpStatus.OK).send({ deleted });
});

export default {
    createQuestionBank,
    getQuestionBanks,
    createQuestionInBank,
    updateQuestionBank,
    getQuestionBank,
    importQuestionToBank,
    updateQuestionInBank,
    deleteQuestionBank,
};
