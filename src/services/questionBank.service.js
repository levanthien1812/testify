import QuestionBank from "../models/questionBank.model.js";
import questionService from "./question.service.js";

const createQuestionBank = async (bankBody) => {
    const questionBank = await QuestionBank.create(bankBody);
    return questionBank;
};

const getQuestionBanksByMakerId = async (makerId) => {
    const questionBanks = await QuestionBank.find({ maker_id: makerId });
    // bookmarked banks come first
    questionBanks.sort((a, b) => {
        if (a.is_bookmarked && !b.is_bookmarked) {
            return -1;
        }
        if (!a.is_bookmarked && b.is_bookmarked) {
            return 1;
        }
        return 0;
    });
    return questionBanks;
};

const addQuestionsToBank = async (bankId, questionIds) => {
    const updatedBank = await QuestionBank.findByIdAndUpdate(
        bankId,
        {
            $addToSet: { question_ids: { $each: questionIds } },
            $set: { updated_at: Date.now() },
        },
        { new: true }
    );

    return updatedBank;
};

const getQuestionBankById = async (bankId) => {
    const questionBank = await QuestionBank.findById(bankId);

    return questionBank;
};

const getQuestionsByBankId = async (bankId) => {
    const questionBank = await QuestionBank.findById(bankId);

    const questions = await Promise.all(
        questionBank.questions.map(async (question) => {
            const content = await questionService.getQuestionContent(
                question.id
            );

            return {
                ...question.toObject(),
                content: content,
            };
        })
    );

    return questions;
};

const getQuestionBankByIdWithQuestions = async (bankId) => {
    const questionBank = await QuestionBank.findById(bankId);
    const questions = await getQuestionsByBankId(bankId);

    return {
        ...questionBank.toObject(),
        questions: questions,
    };
};

const createQuestionInBank = async (questionBody) => {
    const question = await questionService.createQuestion(questionBody);
    return question;
};

const updateQuestionBank = async (bankId, bankBody) => {
    const bank = await QuestionBank.findByIdAndUpdate(bankId, bankBody, {
        new: true,
    });
    return bank;
};

const deleteQuestionBank = async (bankId) => {
    const bank = await QuestionBank.findByIdAndDelete(bankId);
    return bank;
};

const removeQuestionFromBank = async (bankId, questionId) => {
    const bank = await QuestionBank.findByIdAndUpdate(
        bankId,
        {
            $pull: { question_ids: questionId },
            $set: { updated_at: Date.now() },
        },
        { new: true }
    );

    return bank;
};

export default {
    createQuestionBank,
    getQuestionBanksByMakerId,
    addQuestionsToBank,
    createQuestionInBank,
    updateQuestionBank,
    getQuestionBankById,
    getQuestionsByBankId,
    getQuestionBankByIdWithQuestions,
    deleteQuestionBank,
    removeQuestionFromBank,
};
