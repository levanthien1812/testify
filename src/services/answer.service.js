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

const saveAnswer = async (userId, questionId, answerBody) => {
    const question = await Question.findById(questionId);

    if (!question) {
        throw new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    const newAnswer = await Answer.create({
        question_id: questionId,
        user_id: userId,
        date: new Date(),
    });

    const answerContent = { answer_id: newAnswer.id, ...answerBody };
    let answerContentDoc;
    let questionContentQuery;

    switch (question.type) {
        case questionTypes.MULITPLE_CHOICES:
            answerContentDoc = await MultipleChoicesAnswer.create(
                answerContent
            );
            questionContentQuery = MultipleChoiceQuestion.findOne({
                question_id: questionId,
            });
            break;
        case questionTypes.FILL_GAPS:
            answerContentDoc = await FillGapsAnswer.create(answerContent);
            questionContentQuery = FillGapsQuestion.findOne({
                question_id: questionId,
            });
            break;
        case questionTypes.MATCHING:
            answerContentDoc = await MatchingAnswer.create(answerContent);
            questionContentQuery = MatchingQuestion.findOne({
                question_id: questionId,
            });
            break;
        default:
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid question type");
    }

    const questionContentDoc = await questionContentQuery.select("answer");

    if (
        sameItems(
            answerContentDoc.answer,
            questionContentDoc.answer,
            question.type === questionTypes.FILL_GAPS
        )
    ) {
        newAnswer.is_correct = true;
    } else {
        newAnswer.is_correct = false;
    }
    await newAnswer.save();

    return newAnswer;
};

export default {
    saveAnswer,
};
