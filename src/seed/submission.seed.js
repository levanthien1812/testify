import { faker } from "@faker-js/faker";
import { Test } from "../models/test.model.js";
import { User } from "../models/user.model.js";
import { Submission } from "../models/submission.model.js";
import { logger } from "../config/logger.js";
import { createRandomAnswer } from "./userAnswer.seed.js";
import { Question } from "../models/question.model.js";
import submissionService from "../services/submission.service.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";

const createRandomSubmission = async (test, taker) => {
    const startTime = new Date();
    const submitTime = new Date(startTime).setMinutes(
        startTime.getMinutes() +
            faker.number.int({ min: 1, max: test.duration })
    );

    const submission = await Submission.create({
        taker_id: taker._id,
        test_id: test._id,
        score: 0,
        start_time: startTime,
        submit_time: submitTime,
        correct_answers: 0,
        wrong_answers: 0,
        remark: faker.lorem.sentence(),
    });

    const questions = await Question.find({ test_id: test._id });
    const randomQuestions = faker.helpers.arrayElements(questions, {
        min: questions.length / 2,
        max: questions.length,
    });

    await Promise.all(
        randomQuestions.map(async (question) => {
            await createRandomAnswer(question, submission);
        })
    );

    await submissionService.scoreSubmission(submission._id);
};

export const seedSubmissions = async () => {
    logger.info("Seeding submissions...");

    const tests = await Test.find();

    await Promise.all(
        tests.map(async (test) => {
            const takers = await User.find({
                _id: { $in: test.taker_ids },
            });

            const randomTakers = faker.helpers.arrayElements(takers, {
                min: 1,
                max: takers.length,
            });

            await Promise.all(
                randomTakers.map(async (taker) => {
                    await createRandomSubmission(test, taker);
                })
            );

            test.datetime = faker.date.recent({
                days: 2,
                refDate: test.datetime,
            });

            if (test.datetime.getTime() < new Date().getTime()) {
                test.status = TEST_STATUS.PUBLISHED;
            }

            await test.save({ validateBeforeSave: false });
        })
    );

    logger.info("Seed submissions done.");
};
