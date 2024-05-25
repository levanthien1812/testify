import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import { Question } from "../models/question.model.js";
import { questionTypes } from "../config/questionTypes.js";
import { MultipleChoiceQuestion } from "../models/multipleChoicesQuestion.model.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { logger } from "../config/logger.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";

const createInitQuestions = async (testId) => {
    const test = Test.findById(testId);
    if (!test) {
        return new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    let index = 0;
    Question.findOne({ test_id: testId })
        .sort({ order: -1 })
        .exec((err, doc) => {
            if (err) {
                throw err;
            } else {
                index = doc.order;
            }
        });

    let questions = [];
    while (index < test.num_questions) {
        let newQuestion = await Question.create({
            order: index + 1,
            test_id: testId,
            score: 0,
        });

        if (newQuestion) questions.push(newQuestion);

        index++;
    }

    return questions;
};

const updateQuestionPart = async (testId, order, partNumber) => {
    const updatedQuestion = await Question.findOneAndUpdate(
        { test_id: testId, order: order },
        { $set: { part_number: partNumber } },
        { new: true }
    );

    return updatedQuestion;
};

const updateQuestion = async (questionId, questionBody) => {
    const updatedQuestion = await Question.findOneAndUpdate(
        { _id: questionId },
        { $set: questionBody },
        { new: true }
    );

    if (!questionBody.content) return updatedQuestion;

    const questionContent = {
        ...questionBody.content,
        question_id: questionId,
    };

    let question;
    switch (questionBody.type) {
        case questionTypes.MULITPLE_CHOICES:
            question = await MultipleChoiceQuestion.create(questionContent);
            break;
        case questionTypes.FILL_GAPS:
            question = await FillGapsQuestion.create(questionContent);
            break;
        case questionTypes.MATCHING:
            const { left_items: leftItems, right_items: rightItems } =
                questionContent;
            if (leftItems.length !== rightItems.length) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    "Number of left items and right items must be the same "
                );
            }
            question = await MatchingQuestion.create(questionContent);
            break;
        default:
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid question type");
    }

    return { question: updatedQuestion, content: question };
};

const addAnswer = async (questionId, answerBody) => {
    const question = await Question.findById(questionId);

    if (!question) {
        return new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    let updated;

    switch (question.type) {
        case questionTypes.MULITPLE_CHOICES:
            updated = await MultipleChoiceQuestion.findOneAndUpdate(
                { question_id: questionId },
                { $set: answerBody }
            );
            break;
        case questionTypes.FILL_GAPS:
            updated = await FillGapsQuestion.findOneAndUpdate(
                { question_id: questionId },
                { $set: answerBody }
            );
            break;
        case questionTypes.MATCHING:
            updated = await MatchingQuestion.findOneAndUpdate(
                { question_id: questionId },
                { $set: answerBody }
            );
            break;
    }

    return updated;
};

const getQuestionsByTestId = async (testId) => {
    const questions = await Question.find({ test_id: testId });

    return questions;
};

const getQuestionContent = async (questionId, userRole) => {
    const question = await Question.findById(questionId);

    if (!question) {
        throw new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    let content;

    switch (question.type) {
        case questionTypes.MULITPLE_CHOICES:
            content = await MultipleChoiceQuestion.findOne({
                question_id: questionId,
            }).select(userRole === "maker" && "+answer");
            break;
        case questionTypes.FILL_GAPS:
            content = await FillGapsQuestion.findOne({
                question_id: questionId,
            }).select(userRole === "maker" && "+answer");
            break;
        case questionTypes.MATCHING:
            content = await MatchingQuestion.findOne({
                question_id: questionId,
            }).select(userRole === "maker" && "+answer");
            break;
    }

    return content;
};

const getQuestionsContent = async (questions, userRole) => {
    const questionsWithContent = await Promise.all(
        questions.map(async (question) => {
            const content = getQuestionContent(question.id, userRole);

            return { ...question.toObject(), content };
        })
    );

    return questionsWithContent;
};

const getQuestionsByPart = async (partId) => {
    return await Question.find({ part_id: partId });
};

export default {
    createInitQuestions,
    updateQuestion,
    updateQuestionPart,
    addAnswer,
    getQuestionsByTestId,
    getQuestionContent,
    getQuestionsContent,
    getQuestionsByPart,
};
