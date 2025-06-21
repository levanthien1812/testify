import QuestionBank from "../models/questionBank.model.js";
import questionService from "./question.service.js";

const createQuestionBank = async (bankBody) => {
    const questionBank = await QuestionBank.create(bankBody);
    return questionBank;
};

const getQuestionBanksByUserId = async (userId) => {
    const questionBanks = await QuestionBank.find({ user_id: userId });
    return questionBanks;
};

const addQuestionToBank = async (bankId, questionId) => {
    const updatedBank = await QuestionBank.findByIdAndUpdate(
        bankId,
        { $push: { questions: questionId }, updated_at: Date.now() },
        { new: true }
    );

    return updatedBank;
};

const getQuestionBankById = async (bankId) => {
    const questionBank = await QuestionBank.findById(bankId).populate(
        "questions"
    );
    return questionBank;
};

const createQuestionInBank = async (bankId, questionBody) => {
    const question = await questionService.createQuestion(questionBody);
    return question;
};

const updateQuestionBank = async (bankId, bankBody) => {
    const bank = await QuestionBank.findByIdAndUpdate(bankId, bankBody, {
        new: true,
    });
    return bank;
};

export default {
    createQuestionBank,
    getQuestionBanksByUserId,
    addQuestionToBank,
    createQuestionInBank,
    updateQuestionBank,
};
