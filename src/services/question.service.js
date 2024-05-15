import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import { Question } from "../models/question.model.js";
import { questionTypes } from "../config/questionTypes.js";
import { MultipleChoiceQuestion } from "../models/multipleChoicesQuestion.model.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { logger } from "../config/logger.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";

const createInitQuestions = async (testId, numQuestions) => {
    const test = Test.findById(testId);
    if (!test) {
        return new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    let index = 0;
    let questions = [];
    while (index < numQuestions) {
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

const getQuestionByTestId = async (testId) => {
    const questions = await Question.find({ test_id: testId });

    return questions;
};

const getQuestionContent = async (questionId) => {
    const question = await Question.findById(questionId);

    if (!question) {
        throw new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    let content;

    switch (question.type) {
        case questionTypes.MULITPLE_CHOICES:
            content = await MultipleChoiceQuestion.findOne({
                question_id: questionId,
            });
            break;
        case questionTypes.FILL_GAPS:
            content = await FillGapsQuestion.findOne({
                question_id: questionId,
            });
            break;
        case questionTypes.MATCHING:
            content = await MatchingQuestion.findOne({
                question_id: questionId,
            });
            break;
    }

    return content;
};

export default {
    createInitQuestions,
    updateQuestion,
    updateQuestionPart,
    addAnswer,
    getQuestionByTestId,
    getQuestionContent
};
