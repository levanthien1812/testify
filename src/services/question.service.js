import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import { Question } from "../models/question.model.js";
import { questionTypes } from "../config/questionTypes.js";
import partService from "./part.service.js";
import answerService from "./answer.service.js";
import { questionTypeToQuestionModel } from "../utils/mapping.js";
import { Submission } from "../models/submission.model.js";
import testService from "./test.service.js";
import { autoScoreTypes } from "../config/constants.js";

const createQuestionContent = async (questionType, questionContent) => {
    const model = questionTypeToQuestionModel.get(questionType);

    if (!model) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid question type");
    }

    if (questionType === questionTypes.MATCHING) {
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

    if (questionType === questionTypes.MATCHING) {
        const { left_items: leftItems, right_items: rightItems } =
            questionContent;
        if (leftItems.length !== rightItems.length) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Number of left items and right items must be the same "
            );
        }
    }

    let updatedQuestionContentDoc = await model.findOneAndUpdate(
        { question_id: questionId },
        questionContent,
        { new: true }
    );

    return updatedQuestionContentDoc;
};

const deleteQuestionContent = async (questionId, questionType) => {
    let model = questionTypeToQuestionModel.get(questionType);
    await model.findOneAndDelete({ question_id: questionId });
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

    if (question.type !== questionBody.type) {
        // Delete previous question content doc
        await deleteQuestionContent(questionId, question.type);

        // Create new question content doc
        const questionContent = {
            ...questionBody.content,
            question_id: question._id,
        };

        const questionContentDoc = await createQuestionContent(
            questionBody.type,
            questionContent
        );

        return { question: updatedQuestion, content: questionContentDoc };
    } else {
        const updatedQuestionContentDoc = await updateQuestionContent(
            questionId,
            question.type,
            questionBody.content
        );

        return {
            question: updatedQuestion,
            content: updatedQuestionContentDoc,
        };
    }
};

const checkAnswersProvided = async (testId) => {
    const questions = await Question.find({ test_id: testId });

    const areAnswersProvided = questions.every((question) => {
        return autoScoreTypes.includes(question.type) && !!question.answer;
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
        { $set: answerBody }
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
            are_answers_provided: true,
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
    withTakerAnswers,
    withCorrectAnswers,
    takerId = null
) => {
    const questionsWithContent = await Promise.all(
        questions.map(async (question) => {
            const content = await getQuestionContent(
                question.id,
                user.role === "maker" ||
                    (user.role === "taker" && withCorrectAnswers)
            );

            if (
                (user.role === "taker" && withTakerAnswers) ||
                (user.role === "maker" && takerId)
            ) {
                const submission = await Submission.findOne({
                    test_id: question.test_id,
                    taker_id:
                        (user.role === "maker" && takerId) ||
                        (user.role === "taker" && user.id),
                });

                let answer =
                    await answerService.findByQuestionIdAndSubmissionId(
                        question.id,
                        submission.id,
                        withCorrectAnswers
                    );

                if (answer) {
                    const answerContent =
                        await answerService.getAnswerContentByAnswerId(
                            answer.id,
                            question.type
                        );

                    answer = { ...answer.toObject(), content: answerContent };
                }

                return { ...question.toObject(), content, answer };
            }

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

export default {
    createQuestion,
    updateQuestion,
    addAnswer,
    getQuestionsByTestId,
    getQuestionContent,
    getQuestionsContent,
    getQuestionsByPart,
    validateQuestions,
};
