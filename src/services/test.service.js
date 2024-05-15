import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import questionService from "./question.service.js";
import { Question } from "../models/question.model.js";
import { questionTypes } from "../config/questionTypes.js";
import { MultipleChoiceQuestion } from "../models/multipleChoicesQuestion.model.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";
import { User } from "../models/user.model.js";
import answerService from "./answer.service.js";

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

const getTest = async (testId, user) => {
    const test = await Test.findById(testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "No test found with this ID");
    }

    if (user.role === "taker") {
        if (!test.taker_ids.includes(user.id)) {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                "You dont have access to this test!"
            );
        } else {
            if (new Date(test.datetime) > new Date()) {
                throw new ApiError(
                    httpStatus.FORBIDDEN,
                    "This test is not opened yet!"
                );
            }
        }
    }

    const questions = await Question.find({ test_id: test.id });

    const questionsWithContent = await Promise.all(
        questions.map(async (question) => {
            const content = await questionService.getQuestionContent(question.id);

            return { ...question.toObject(), content };
        })
    );

    return { ...test.toObject(), questions: questionsWithContent };
};

const assignTakers = async (testId, takerIds) => {
    const test = await Test.findById(testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    let notFoundTakerIds = [];
    takerIds.forEach(async (takerId) => {
        if (!(await User.find({ _id: takerId, role: "taker" }))) {
            notFoundTakerIds.push(takerId);
        }
    });

    takerIds = takerIds.filter((takerId) => {
        return !test.taker_ids.includes(takerId);
    });

    if (notFoundTakerIds.length > 0)
        return new ApiError(
            httpStatus.NOT_FOUND,
            `Takers with id ${notFoundTakerIds.join(", ")} not found`
        );

    if (takerIds.length === 0) return test;

    const updateTest = await Test.findByIdAndUpdate(
        testId,
        {
            $set: { taker_ids: takerIds },
        },
        { new: true }
    );

    return updateTest;
};

export default { createTest, addParts, getTests, getTest, assignTakers };
