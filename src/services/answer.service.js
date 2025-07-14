import httpStatus from "http-status";
import { Question } from "../models/question.model.js";
import { ApiError } from "../utils/apiError.js";
import { Answer } from "../models/answer.model.js";
import {
    questionTypeToAnswerModel,
    questionTypeToQuestionModel,
} from "../utils/mapping.js";
import { isEqual } from "../utils/isEqual.js";
import submissionService from "./submission.service.js";

const createAnswers = async (submissionId, answersBody) => {
    const answers = await Promise.all(
        answersBody.map(
            async (answerBody) => await createAnswer(submissionId, answerBody)
        )
    );

    return answers;
};

const createAnswer = async (submissionId, answerBody) => {
    const question = await Question.findById(answerBody.question_id);

    if (!question) {
        throw new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    const skipped = answerBody.content ? false : true;

    let newAnswer = await Answer.create({
        question_id: answerBody.question_id,
        submission_id: submissionId,
        date: new Date(),
        is_correct: false,
        score: 0,
        skipped: skipped,
    });

    if (skipped) {
        return newAnswer;
    }

    let answerContent = {
        answer_id: newAnswer.id,
        answer: { ...answerBody.content },
    };

    const answerModel = questionTypeToAnswerModel.get(question.type);
    await answerModel.create(answerContent);

    newAnswer = await scoreAnswerByAnswerId(newAnswer.id);

    return newAnswer;
};

const updateAnswer = async (answerId, answerBody) => {
    const answer = await Answer.findById(answerId);

    if (!answer) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Answer not found!");
    }

    let updatedAnswer = await Answer.findByIdAndUpdate(
        answer.id,
        { $set: answerBody },
        {
            new: true,
        }
    );

    if (answerBody.score !== undefined) {
        updatedAnswer.evaluated = true;
        await updatedAnswer.save();
    }

    await submissionService.scoreSubmission(answer.submission_id);

    return updatedAnswer;
};

const scoreAnswerByAnswerId = async (answerId) => {
    const answer = await Answer.findById(answerId);

    if (!answer || answer.skipped) {
        return answer;
    }

    const question = await Question.findById(answer.question_id);
    const questionModel = questionTypeToQuestionModel.get(question.type);

    const answerContent = await getAnswerContentByAnswerId(
        answerId,
        question.type
    );

    let questionContent = await questionModel
        .findOne({
            question_id: question.id,
        })
        .select("answer");

    if (questionContent.answer) {
        if (
            isEqual(
                answerContent.answer.toObject(),
                questionContent.answer.toObject()
            )
        ) {
            answer.is_correct = true;
            answer.score = question.score;
        } else {
            answer.is_correct = false;
            answer.score = 0;
        }
        answer.evaluated = true;
        await answer.save();
    }

    return answer;
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
        `-__v -submission_id -question_id ${
            !withCorrectAnswer ? "-is_correct -score" : ""
        }`
    );

    return answer;
};

const getAnswerContentByAnswerId = async (answerId, questionType = null) => {
    if (!questionType) {
        const answer = await Answer.findById(answerId);
        const question = await Question.findById(answer.question_id);
        questionType = question.type;
    }
    const model = questionTypeToAnswerModel.get(questionType);
    const answerContent = await model
        .findOne({
            answer_id: answerId,
        })
        .select(`-__v -answer_id`);

    return answerContent;
};

const getAnswersBySubmissionId = async (submissionId, options) => {
    const answers = await Answer.find({
        submission_id: submissionId,
    }).select(`${options?.excludeScore ? "-score -is_correct" : ""}`);

    const answersWithContent = await Promise.all(
        answers.map(async (answer) => {
            const answerContent = await getAnswerContentByAnswerId(answer.id);
            return {
                ...answer.toObject(),
                content: answerContent ? answerContent.answer : null,
            };
        })
    );

    return answersWithContent;
};

export default {
    createAnswers,
    updateAnswer,
    findByQuestionIdAndSubmissionId,
    getAnswerContentByAnswerId,
    scoreAnswerByAnswerId,
    getAnswersBySubmissionId,
};
