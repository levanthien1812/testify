import httpStatus from "http-status";
import { Question } from "../models/question.model.js";
import { ApiError } from "../utils/apiError.js";
import { Answer } from "../models/answer.model.js";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { sameItems } from "../utils/compareArray.js";
import {
    questionTypeToAnswerModel,
    questionTypeToQuestionModel,
} from "../utils/mapping.js";
import { AUTO_SCORE_TYPE } from "../config/constants/constants.js";
import submissionService from "./submission.service.js";
import _ from "lodash";

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

    let newAnswer = await Answer.create({
        question_id: answerBody.question_id,
        submission_id: submissionId,
        date: new Date(),
    });

    let answerContent = {
        answer_id: newAnswer.id,
        answer: { ...answerBody.content },
    };

    const answerModel = questionTypeToAnswerModel.get(question.type);
    await answerModel.create(answerContent);

    if (AUTO_SCORE_TYPE.includes(question.type)) {
        newAnswer = await scoreAnswerByAnswerId(newAnswer.id);
    }

    return newAnswer;
};

const updateAnswer = async (answerId, answerBody) => {
    const answer = await Answer.findById(answerId);

    if (!answer) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Answer not found!");
    }

    const updatedAnswer = await Answer.findByIdAndUpdate(
        answer.id,
        { $set: answerBody },
        {
            new: true,
        }
    );

    await scoreAnswerByAnswerId(updatedAnswer.id);

    return updatedAnswer;
};

const scoreAnswerByAnswerId = async (answerId) => {
    const answer = await Answer.findById(answerId);

    if (!answer) {
        throw new ApiError(httpStatus.NOT_FOUND, "Answer not found!");
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
    console.log(_.isEqual(answerContent.answer, questionContent.answer));

    if (questionContent.answer) {
        if (
            // sameItems(
            //     answerContent.answer,
            //     questionContent.answer,
            //     question.type === QUESTION_TYPE.FILL_GAPS
            // )
            _.isEqual(answerContent.answer, questionContent.answer)
        ) {
            answer.is_correct = true;
            answer.score = question.score;
        } else {
            answer.is_correct = false;
            answer.score = 0;
        }
        await answer.save();
    }

    await submissionService.scoreSubmission(answer.submission_id);

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
        .select("-__v -answer_id ");

    return answerContent;
};

const getAnswersBySubmissionId = async (submissionId) => {
    const answers = await Answer.find({
        submission_id: submissionId,
    }).select("-submission_id");

    const answersWithContent = await Promise.all(
        answers.map(async (answer) => {
            const answerContent = await getAnswerContentByAnswerId(answer.id);
            return { ...answer.toObject(), content: answerContent.answer };
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
