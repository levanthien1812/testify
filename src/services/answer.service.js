import httpStatus from "http-status";
import { Question } from "../models/question.model.js";
import { ApiError } from "../utils/apiError.js";
import { Answer } from "../models/answer.model.js";
import { questionTypes } from "../config/questionTypes.js";
import { sameItems } from "../utils/compareArray.js";
import {
    questionTypeToAnswerModel,
    questionTypeToQuestionModel,
} from "../utils/mapping.js";
import { Submission } from "../models/submission.model.js";

const createAnswers = async (submissionId, answersBody) => {
    const answers = [];

    for (const answerBody of answersBody) {
        const newAnswer = await createAnswer(submissionId, answerBody);
        answers.push(newAnswer);
    }

    return answers;
};

const createAnswer = async (submissionId, answerBody) => {
    const question = await Question.findById(answerBody.question_id);

    if (!question) {
        throw new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    const newAnswer = await Answer.create({
        question_id: answerBody.question_id,
        submission_id: submissionId,
        date: new Date(),
    });

    const answerContent = { answer_id: newAnswer.id, ...answerBody };

    const answerModel = questionTypeToAnswerModel.get(question.type);
    const questionModel = questionTypeToQuestionModel.get(question.type);

    let answerContentDoc = await answerModel.create(answerContent);
    let questionContentDoc = await questionModel
        .findOne({
            question_id: answerBody.question_id,
        })
        .select("answer");

    if (questionContentDoc.answer) {
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
    }

    return newAnswer;
};

const scoreAnswers = async (submissionId) => {
    const submission = await Submission.findById(submissionId);

    if (!submission) {
        throw new ApiError(httpStatus.NOT_FOUND, "Submission not found!");
    }
};

const findByQuestionIdAndSubmissionId = async (
    questionId,
    submissionId,
    withCorrectAnswer = true
) => {
    const answer = await Answer.findOne({
        question_id: questionId,
        submission_id: submissionId,
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
    findByQuestionIdAndSubmissionId,
    getAnswerContentByAnswerId,
};
