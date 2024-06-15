import httpStatus from "http-status";
import { Question } from "../models/question.model.js";
import { ApiError } from "../utils/apiError.js";
import { Answer } from "../models/answer.model.js";
import { questionTypes } from "../config/questionTypes.js";
import { MultipleChoicesAnswer } from "../models/multipleChoicesAnswer.model.js";
import { FillGapsAnswer } from "../models/fillGapsAnswer.model.js";
import { MultipleChoiceQuestion } from "../models/multipleChoicesQuestion.model.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";
import { sameItems } from "../utils/compareArray.js";
import { MatchingAnswer } from "../models/matchingAnswer.model.js";
import {
    questionTypeToAnswerModel,
    questionTypeToQuestionModel,
} from "../utils/mapping.js";

const createAnswers = async (userId, answersBody) => {
    const answers = [];

    for (const answerBody of answersBody) {
        const newAnswer = await createAnswer(userId, answerBody);
        answers.push(newAnswer);
    }

    return answers;
};

const createAnswer = async (userId, answerBody) => {
    const question = await Question.findById(answerBody.question_id);

    if (!question) {
        throw new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    const newAnswer = await Answer.create({
        question_id: answerBody.question_id,
        user_id: userId,
        date: new Date(),
    });

    const answerContent = { answer_id: newAnswer.id, ...answerBody };

    const model = questionTypeToQuestionModel.get(question.type);
    let answerContentDoc = await model.create(answerContent);
    let questionContentDoc = await model
        .findOne({
            question_id: answerBody.question_id,
        })
        .select("answer");

    if (
        sameItems(
            answerContentDoc.answer,
            questionContentDoc.answer,
            question.type === questionTypes.FILL_GAPS
        )
    ) {
        newAnswer.is_correct = true;
        newAnswer.score = question.score;
    } else {
        newAnswer.is_correct = false;
        newAnswer.score = 0;
    }
    await newAnswer.save();

    return newAnswer;
};

const findByQuestionIdAndUserId = async (
    questionId,
    userId,
    withCorrectAnswer = true
) => {
    const answer = await Answer.findOne({
        question_id: questionId,
        user_id: userId,
    }).select(
        `-__v -user_id -question_id ${
            !withCorrectAnswer ? "-is_correct -score" : ""
        }`
    );

    return answer;
};

const getAnswerContentByAnswerId = async (answerId, questionType) => {
    const model = questionTypeToAnswerModel.get(questionType);
    const answerContent = await model
        .findOne({
            answer_id: answerId,
        })
        .select("-__v -answer_id ");

    return answerContent;
};

export default {
    createAnswers,
    findByQuestionIdAndUserId,
    getAnswerContentByAnswerId,
};
