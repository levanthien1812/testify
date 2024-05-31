import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import { Question } from "../models/question.model.js";
import { questionTypes } from "../config/questionTypes.js";
import { MultipleChoiceQuestion } from "../models/multipleChoicesQuestion.model.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { logger } from "../config/logger.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";
import partService from "./part.service.js";

const createQuestion = async (questionBody) => {
    const newQuestion = await Question.create(questionBody);

    const questionContent = {
        ...questionBody.content,
        question_id: newQuestion._id,
    };

    let questionContentDoc;
    switch (questionBody.type) {
        case questionTypes.MULITPLE_CHOICES:
            questionContentDoc = await MultipleChoiceQuestion.create(
                questionContent
            );
            break;
        case questionTypes.FILL_GAPS:
            questionContentDoc = await FillGapsQuestion.create(questionContent);
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
            questionContentDoc = await MatchingQuestion.create(questionContent);
            break;
        default:
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid question type");
    }

    return { question: newQuestion, content: questionContentDoc };
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
            const content = await getQuestionContent(question.id, userRole);

            return { ...question.toObject(), content };
        })
    );

    return questionsWithContent;
};

const validateQuestions = async (testId) => {
    const test = await Test.findById(testId);
    let validated;

    if (test.num_parts === 1) {
        const questions = await Question.find({ test_id: testId });

        const totalQuestionsScores = questions.reduce(
            (acc, question) => acc + question.score,
            0
        );

        if (totalQuestionsScores !== test.max_score) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Total questions score must be equal to test score"
            );
        } else {
            validated = true;
        }
    } else {
        const parts = await partService.getPartsByTestId(testId);

        validated = parts.reduce(async (acc, part) => {
            const questions = await Question.find({ part_id: part.id });

            const totalQuestionsScores = questions.reduce(
                (acc, question) => acc + question.score,
                0
            );

            if (totalQuestionsScores !== part.score) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `Total questions score of part ${part.name} is not equal to part score`
                );
            }

            return acc && true;
        }, true);
    }

    return validated;
};

const getQuestionsByPart = async (partId) => {
    return await Question.find({ part_id: partId });
};

export default {
    createQuestion,
    addAnswer,
    getQuestionsByTestId,
    getQuestionContent,
    getQuestionsContent,
    getQuestionsByPart,
    validateQuestions,
};
