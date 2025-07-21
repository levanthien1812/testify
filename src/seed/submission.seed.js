import { faker } from "@faker-js/faker";
import { Submission } from "../models/submission.model.js";
import { createRandomAnswer } from "./userAnswer.seed.js";
import { Question } from "../models/question.model.js";
import submissionService from "../services/submission.service.js";
import { seedTakersForMaker } from "./taker.seed.js";
import testService from "../services/test.service.js";
import takerService from "../services/taker.service.js";
import { logger } from "../config/logger.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";

export const createRandomSubmission = async (test, takerId) => {
    const startTime = new Date();
    const submitTime = startTime.setMinutes(
        startTime.getMinutes() +
            faker.number.int({ min: 1, max: parseInt(test.duration) })
    );

    const submission = await Submission.create({
        taker_id: takerId,
        test_id: test.id,
        score: 0,
        start_time: startTime,
        submit_time: submitTime,
        correct_answers: 0,
        wrong_answers: 0,
        remark: faker.lorem.sentence(),
    });

    const questions = await Question.find({ test_id: test.id });

    logger.info("Seeding answers for submission " + submission.id + "...");
    await Promise.all(
        questions.map(async (question) => {
            await createRandomAnswer(question, submission);
        })
    );
    logger.info("Seed answers for submission " + submission.id + " done");

    await submissionService.scoreSubmission(submission.id);
};

// PRE-CONDITIONS
// Test is provided
// Questions are provided
// Answers for questions are provided
export const mockSubmissions = async (testId) => {
    logger.info("Seeding submissions for " + testId + "...");
    const test = await testService.findById(testId);
    const MIN_TAKERS = 5;

    let randomTakerIds;
    if (test.share_option === SHARE_OPTION.RESTRICTED) {
        if (!test.taker_ids || test.taker_ids.length < MIN_TAKERS) {
            const newTakers = await seedTakersForMaker(
                test.maker_id,
                MIN_TAKERS
            );
            await testService.assignTakers(
                test.id,
                newTakers.map((taker) => taker.id)
            );
            randomTakerIds = faker.helpers
                .arrayElements(newTakers, {
                    min: MIN_TAKERS,
                    max: newTakers.length,
                })
                .map((taker) => taker.id);
        } else {
            randomTakerIds = faker.helpers.arrayElements(test.taker_ids, {
                min: MIN_TAKERS,
                max: test.taker_ids.length,
            });
        }
    } else {
        const takers = await takerService.getTakersByMaker(test.maker_id);
        randomTakerIds = faker.helpers
            .arrayElements(takers, {
                min: MIN_TAKERS,
                max: takers.length,
            })
            .map((taker) => taker.id);
    }

    await submissionService.deleteSubmissionsByTestId(test.id);

    await Promise.all(
        randomTakerIds.map(async (takerId) => {
            await createRandomSubmission(test, takerId);
            await testService.addAccessedBy(test.id, takerId);
        })
    );

    logger.info("Seed submissions done");
};
