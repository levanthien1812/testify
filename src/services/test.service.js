import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import questionService from "./question.service.js";
import { Question } from "../models/question.model.js";
import { questionTypes } from "../config/questionTypes.js";
import { MultipleChoiceQuestion } from "../models/mulitpleChoicesQuestion.model.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";

const createTest = async (testBody) => {
    const newTest = await Test.create(testBody);
    return newTest;
};

const addParts = async (testId, partsBody) => {
    const test = await Test.findById(testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    if (partsBody.parts.length > 0) {
        const totalPartsScore = partsBody.parts.reduce((prev, curr) => {
            return prev + curr.score;
        }, 0);

        const totalNumQuestions = partsBody.parts.reduce((prev, curr) => {
            return prev + curr.num_questions;
        }, 0);

        if (totalPartsScore !== test.max_score) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Total score of parts must be equal to test score"
            );
        }

        if (totalNumQuestions !== test.num_questions) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Total number of questions of parts must be equal to test's number of questions"
            );
        }
    }

    test.parts = partsBody.parts;
    await test.save();
    return test;
};

const getTests = async (filter, query) => {
    const tests = await Test.paginate(filter, query);

    const testsWithQuestions = await Promise.all(
        tests.results.map(async (test) => {
            const questions = await Question.find({ test_id: test.id });

            return { ...test.toObject(), questions };
        })
    );

    return testsWithQuestions;
};

const getTest = async (testId) => {
    const test = await Test.findById(testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "No test found with this ID");
    }

    const questions = await Question.find({ test_id: test.id });

    const questionsWithContent = await Promise.all(
        questions.map(async (question) => {
            let content;
            switch (question.type) {
                case questionTypes.MULITPLE_CHOICES:
                    content = await MultipleChoiceQuestion.findOne({
                        question_id: question.id,
                    });
                    break;
                case questionTypes.FILL_GAPS:
                    content = await FillGapsQuestion.findOne({
                        question_id: question.id,
                    });
                    break;
                case questionTypes.MATCHING:
                    content = await MatchingQuestion.findOne({
                        question_id: question.id,
                    });
                    break;
                default:
                    break;
            }

            return { ...question.toObject(), content };
        })
    );

    return { ...test.toObject(), questions: questionsWithContent };
};

export default { createTest, addParts, getTests, getTest };
