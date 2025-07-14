import { faker } from "@faker-js/faker";
import { Test } from "../models/test.model.js";
import { Part } from "../models/part.model.js";
import { logger } from "../config/logger.js";

const createRandomParts = async (test) => {
    let scores = [];
    let remainingScore = test.max_score;
    let numQuestions = [];
    let remainingNumQuestions = test.num_questions;

    for (let i = 0; i < test.num_parts - 1; i++) {
        const numQuestion = faker.number.int({
            multipleOf: 1,
            min: 1,
            max:
                remainingNumQuestions <= (test.num_parts - i - 1) * 1
                    ? 1
                    : remainingNumQuestions - (test.num_parts - i - 1) * 1,
        });
        numQuestions.push(numQuestion);
        remainingNumQuestions -= numQuestion;

        const score = faker.number.float({
            multipleOf: 0.25,
            min: numQuestion * 0.25,
            max:
                remainingScore <= remainingNumQuestions * 0.25
                    ? numQuestion * 0.25
                    : remainingScore - remainingNumQuestions * 0.25,
        });

        scores.push(score);
        remainingScore -= score;
    }

    scores.push(remainingScore);
    numQuestions.push(remainingNumQuestions);

    const parts = scores.map((score, index) => {
        return {
            order: index + 1,
            test_id: test.id,
            name: faker.lorem.sentence(),
            description: faker.lorem.paragraph({ min: 2, max: 4 }),
            score: score,
            num_questions: numQuestions[index],
        };
    });

    return parts;
};

export const seedParts = async (testId) => {
    logger.info("Seeding parts for " + testId + "...");

    const test = await Test.findById(testId);

    if (test.num_parts <= 1) {
        return;
    }
    const parts = await createRandomParts(test);

    await Part.insertMany(parts);

    logger.info("Seed parts done");
};
