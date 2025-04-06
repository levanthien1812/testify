import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import { Question } from "../models/question.model.js";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import partService from "./part.service.js";
import answerService from "./answer.service.js";
import { questionTypeToQuestionModel } from "../utils/mapping.js";
import { Submission } from "../models/submission.model.js";
import testService from "./test.service.js";
import { AUTO_SCORE_TYPE } from "../config/constants/constants.js";
import fse from "fs-extra";
import path from "path";
import { ROLES } from "../config/constants/roles.js";
import { Part } from "../models/part.model.js";
import mongoose from "mongoose";

const createQuestionContent = async (questionType, questionContent) => {
    const model = questionTypeToQuestionModel.get(questionType);

    if (!model) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid question type");
    }

    if (questionType === QUESTION_TYPE.MATCHING) {
        const { left_items: leftItems, right_items: rightItems } =
            questionContent;
        if (leftItems.length !== rightItems.length) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Number of left items and right items must be the same "
            );
        }
    }

    let questionContentDoc = await model.create(questionContent);
    return questionContentDoc;
};

const updateQuestionContent = async (
    questionId,
    questionType,
    questionContent
) => {
    let model = questionTypeToQuestionModel.get(questionType);

    if (questionType === QUESTION_TYPE.MATCHING) {
        const { left_items: leftItems, right_items: rightItems } =
            questionContent;
        if (leftItems.length !== rightItems.length) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Number of left items and right items must be the same "
            );
        }
    }

    if (questionContent.images && questionContent.images.length > 0) {
        const questionContentDoc = await model.findOne({
            question_id: questionId,
        });

        if (questionContentDoc.images) {
            unlinkImages(questionContentDoc.images);
        }
    }

    let updatedQuestionContentDoc;

    const existingQuestionContentDoc = await model.findOne({
        question_id: questionId,
    });

    if (!existingQuestionContentDoc) {
        updatedQuestionContentDoc = await model.create({
            ...questionContent,
            question_id: questionId,
        });
    } else {
        updatedQuestionContentDoc = await model.findOneAndUpdate(
            { question_id: questionId },
            questionContent,
            { new: true }
        );
    }

    return updatedQuestionContentDoc;
};

const deleteQuestionContent = async (questionId, questionType) => {
    let model = questionTypeToQuestionModel.get(questionType);
    const content = await model.findOne({ question_id: questionId });

    if (content && content.images) {
        unlinkImages(content.images);
    }

    const deleted = await model.deleteOne({ question_id: questionId });
    return deleted;
};

const unlinkImages = (images) => {
    images.forEach((image) => {
        fse.unlinkSync(image, (err) => {
            if (err) {
                if (err.code === "ENOENT") {
                    console.log("The file does not exist");
                } else {
                    console.error(err);
                }
            }
        });
    });
};

const createQuestion = async (testId, questionBody) => {
    const newQuestion = await Question.create({
        ...questionBody,
        test_id: testId,
    });

    const questionContent = {
        ...questionBody.content,
        question_id: newQuestion._id,
    };

    const questionContentDoc = await createQuestionContent(
        questionBody.type,
        questionContent
    );

    if (questionContentDoc) {
        newQuestion.is_content_provided = true;
        await newQuestion.save();
    }

    return { question: newQuestion, content: questionContentDoc };
};

const updateQuestion = async (questionId, questionBody) => {
    const question = await Question.findById(questionId);

    if (!question) {
        throw new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        questionBody,
        { new: true }
    );

    updatedQuestion.is_content_provided = false;

    let updatedQuestionContentDoc;

    if (question.type !== questionBody.type) {
        // Delete previous question content doc
        await deleteQuestionContent(questionId, question.type);

        // Create new question content doc
        const questionContent = {
            ...questionBody.content,
            question_id: question._id,
        };

        updatedQuestionContentDoc = await createQuestionContent(
            questionBody.type,
            questionContent
        );
    } else {
        updatedQuestionContentDoc = await updateQuestionContent(
            questionId,
            question.type,
            questionBody.content
        );
    }

    if (updatedQuestionContentDoc) {
        updatedQuestion.is_content_provided = true;
    }
    await updatedQuestion.save();

    return {
        question: updatedQuestion,
        content: updatedQuestionContentDoc,
    };
};

const checkAnswersProvided = async (testId) => {
    const questions = await Question.find({ test_id: testId });

    const areAnswersProvided = questions.every((question) => {
        return AUTO_SCORE_TYPE.includes(question.type) && !!question.answer;
    });

    return areAnswersProvided;
};

// add/update answer
const addAnswer = async (questionId, answerBody) => {
    const question = await Question.findById(questionId);

    if (!question) {
        return new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    const model = questionTypeToQuestionModel.get(question.type);

    let updated = await model.findOneAndUpdate(
        { question_id: questionId },
        { $set: { answer: answerBody } }
    );

    const submissions = await Submission.find({
        test_id: question.test_id,
    });

    if (submissions.length > 0) {
        submissions.map(async (submission) => {
            const answer = await answerService.findByQuestionIdAndSubmissionId(
                questionId,
                submission._id
            );

            // In case submission doesn't have this answer
            if (answer) {
                await answerService.scoreAnswerByAnswerId(answer._id);
            }
        });
    }

    if (await checkAnswersProvided(question.test_id)) {
        await testService.updateTest(question.test_id, {
            $set: { are_answers_provided: true },
        });
    } else {
        await testService.updateTest(question.test_id, {
            $set: { are_answers_provided: false },
        });
    }

    return updated;
};

const getQuestionsByTestId = async (testId) => {
    const questions = await Question.find({ test_id: testId });

    return questions;
};

const getQuestionContent = async (questionId, withCorrectAnswer) => {
    const question = await Question.findById(questionId);

    if (!question) {
        throw new ApiError(httpStatus.NOT_FOUND, "Question not found!");
    }

    const model = questionTypeToQuestionModel.get(question.type);
    let content = await model
        .findOne({ question_id: questionId })
        .select(withCorrectAnswer && "+answer");

    return content;
};

const getQuestionsContent = async (
    questions,
    user,
    withCorrectAnswers,
    takerId = null
) => {
    const questionsWithContent = await Promise.all(
        questions.map(async (question) => {
            const content = await getQuestionContent(
                question.id,
                user.role === ROLES.MAKER ||
                    (user.role === ROLES.TAKER && withCorrectAnswers)
            );

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

        for (let i = 0; i < parts.length; i++) {
            const questions = await Question.find({ part_id: parts[i].id });

            const totalQuestionsScores = questions.reduce(
                (scores, question) => scores + question.score,
                0
            );

            if (totalQuestionsScores !== parts[i].score) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `Total questions score of part ${parts[i].name} is not equal to part score`
                );
            }
        }

        validated = true;
    }

    return validated;
};

const getQuestionsByPart = async (partId) => {
    return await Question.find({ part_id: partId });
};

const deleteQuestion = async (questionId, testId, questionBody) => {
    if (mongoose.Types.ObjectId.isValid(questionId)) {
        const question = await Question.findById(questionId);
        await deleteQuestionContent(questionId, question.type);
        await Question.findByIdAndDelete(questionId);
    }

    const test = await Test.findById(testId);
    await Test.findByIdAndUpdate(testId, {
        $inc: { num_questions: -1 },
    });

    if (test.num_parts === 1 && test.num_questions > 0) {
        // Reorder subsequent questions
        await Question.updateMany(
            { test_id: testId, order: { $gt: questionBody.order } },
            { $inc: { order: -1 } }
        );
    } else {
        const part = await Part.findById(questionBody.part_id);
        if (part.num_questions > 0) {
            await Part.findByIdAndUpdate(questionBody.part_id, {
                $inc: { num_questions: -1 },
            });
        }

        // Reorder subsequent questions
        await Question.updateMany(
            {
                part_id: questionBody.part_id,
                order: { $gt: questionBody.order },
            },
            { $inc: { order: -1 } }
        );
    }

    return true;
};

export default {
    createQuestion,
    updateQuestion,
    addAnswer,
    getQuestionsByTestId,
    getQuestionContent,
    getQuestionsContent,
    getQuestionsByPart,
    validateQuestions,
    deleteQuestion,
};
