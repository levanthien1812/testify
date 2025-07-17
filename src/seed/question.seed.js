import { faker } from "@faker-js/faker";
import { Part } from "../models/part.model.js";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { Test } from "../models/test.model.js";
import { Question } from "../models/question.model.js";
import { logger } from "../config/logger.js";
import { createQuestionContentDoc } from "./questionContent.seed.js";
import { createRandomAnswer } from "./answer.seed.js";
import { ALLOWED_PARTIAL_SCORING_TYPES } from "../config/constants/constants.js";

const createQuestions = (totalScore, numQuestions, testId, partId = null) => {
    let scores = [];
    let remainingScore = totalScore;
    let averageScore = totalScore / numQuestions;

    for (let i = 0; i < numQuestions - 1; i++) {
        const score = faker.number.float({
            min: 0.25,
            max: (Math.round(averageScore * 100) / 100) * 2,
            multipleOf: 0.25,
        });
        scores.push(score);
        remainingScore -= score;
    }
    scores.push(remainingScore);

    const questions = scores.map((score, index) => {
        const randomeType = faker.helpers.arrayElement(
            Object.values(QUESTION_TYPE)
        );

        let partialScoring = false;
        if (ALLOWED_PARTIAL_SCORING_TYPES.includes(randomeType)) {
            partialScoring = faker.datatype.boolean();
        }

        return {
            order: index + 1,
            test_id: testId,
            part_id: partId,
            score,
            type: randomeType,
            partial_scoring: partialScoring,
        };
    });

    return questions;
};

const createRandomQuestions = async (test) => {
    let allQuestions = [];

    if (test.num_parts > 1) {
        const parts = await Part.find({ test_id: test._id });

        parts.forEach((part) => {
            const questions = createQuestions(
                part.score,
                part.num_questions,
                test._id,
                part._id
            );
            allQuestions = allQuestions.concat(questions);
        });
    } else {
        allQuestions = createQuestions(
            test.max_score,
            test.num_questions,
            test._id
        );
    }

    return allQuestions;
};

export const seedQuestions = async (testId) => {
    logger.info("Seeding questions for " + testId + "...");

    const test = await Test.findById(testId);

    const randomQuestions = await createRandomQuestions(test);
    const questions = await Question.insertMany(randomQuestions);

    await Promise.all(
        questions.map(async (question) => {
            await createQuestionContentDoc(question);
            question.is_content_provided = true;
            await question.save();
            await createRandomAnswer(question);
        })
    );

    test.are_answers_provided = true;
    await test.save();
    logger.info("Seed questions done");
};
