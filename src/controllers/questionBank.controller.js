import httpStatus from "http-status";
import questionBankService from "../services/questionBank.service.js";
import catchAsync from "../utils/catchAsync.js";

const createQuestionBank = catchAsync(async (req, res, next) => {
    const body = { ...req.body, user_id: req.user.id, created_at: new Date() };
    const questionBank = await questionBankService.createQuestionBank(body);
    return res.status(httpStatus.CREATED).send(questionBank);
});

const getQuestionBanks = catchAsync(async (req, res, next) => {
    const questionBanks = await questionBankService.getQuestionBanksByUserId(
        req.user.id
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

export default {
    createQuestionBank,
    getQuestionBanks,
    createQuestionInBank,
    updateQuestionBank,
    getQuestionBank,
    importQuestionToBank,
};
