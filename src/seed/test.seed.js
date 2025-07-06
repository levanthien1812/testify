import { TEST_LEVEL } from "../config/constants/levels.js";
import { logger } from "../config/logger.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import { Test } from "../models/test.model.js";
import { User } from "../models/user.model.js";
import { faker } from "@faker-js/faker";
import { ROLES } from "../config/constants/roles.js";
import { seedTakersForMaker } from "./taker.seed.js";
import testService from "../services/test.service.js";
import takerService from "../services/taker.service.js";
import { createRandomSubmission } from "./submission.seed.js";
import submissionService from "../services/submission.service.js";

const createRandomTest = async () => {
    const randomMaker = await User.aggregate([
        { $match: { role: ROLES.MAKER } },
        {
            $sample: {
                size: 1,
            },
        },
    ]);

    const numParts = faker.number.int({ min: 1, max: 4 });
    const numQuestions = faker.number.int({ min: numParts, max: 40 });

    const datetime = faker.date.soon({ days: 4 });

    const closeTime = new Date(datetime);
    closeTime.setMinutes(
        closeTime.getMinutes() + faker.number.int({ min: 1, max: 1440 * 7 })
    );

    const publicAnswersOption =
        Object.values(PUBLIC_ANSWER_OPTION)[
            faker.number.int({
                min: 0,
                max: Object.values(PUBLIC_ANSWER_OPTION).length - 1,
            })
        ];

    let publicAnswersDate;

    switch (publicAnswersOption) {
        case PUBLIC_ANSWER_OPTION.AFTER_CLOSE_TIME:
            publicAnswersDate = closeTime;
            break;
        case PUBLIC_ANSWER_OPTION.AFTER_TAKER_SUBMISSION:
            publicAnswersDate = closeTime;
            break;
        case PUBLIC_ANSWER_OPTION.SPECIFIC_DATE:
            publicAnswersDate = new Date(closeTime);
            publicAnswersDate.setMinutes(
                publicAnswersDate.getMinutes() +
                    faker.number.int({ min: 1, max: 1440 * 7 })
            );

            break;
    }

    const shareOption =
        SHARE_OPTION[
            faker.number.int({ min: 0, max: SHARE_OPTION.length - 1 })
        ];

    const randomTakers =
        shareOption === SHARE_OPTION.ANYONE
            ? []
            : await User.aggregate([
                  { $match: { role: ROLES.TAKER } },
                  {
                      $sample: {
                          size: faker.number.int({ min: 5, max: 40 }),
                      },
                  },
              ]);

    return {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph({ min: 1, max: 4 }),
        maker_id: randomMaker[0]._id,
        duration: faker.number.int({ min: 1, max: 150 }),
        datetime: datetime,
        level: Object.values(TEST_LEVEL)[
            faker.number.int({
                min: 0,
                max: Object.values(TEST_LEVEL).length - 1,
            })
        ],
        num_parts: numParts,
        num_questions: numQuestions,
        max_score: faker.number.int({ min: numQuestions * 0.25, max: 100 }),
        code: faker.string.alphanumeric(),
        status: TEST_STATUS.DRAFT,
        close_time: closeTime,
        share_option: shareOption,
        are_answers_provided: false,
        public_answers_option: publicAnswersOption,
        public_answers_date: publicAnswersDate,
        taker_ids: randomTakers.map((taker) => taker._id),
    };
};

export const seedTests = async () => {
    logger.info("Seeding tests...");

    await Promise.all(
        [...Array(40)].map(async () => {
            const test = await createRandomTest();
            await Test.create(test);
        })
    );

    logger.info("Seed tests done");
};

// PRE-CONDITIONS
// Test is provided
// Questions are provided
// Answers for questions are provided
export const mockSubmissions = async (testId) => {
    const test = await testService.findById(testId);
    const MIN_TAKERS = 30;

    if (!test.taker_ids || test.taker_ids.length < MIN_TAKERS) {
        const newTakers = await seedTakersForMaker(test.maker_id, MIN_TAKERS);
        await testService.assignTakers(
            test.id,
            newTakers.map((taker) => taker.id)
        );
    }

    await submissionService.deleteSubmissionsByTestId(test.id);
    const takers = await takerService.getTakersByMaker(test.maker_id);
    await Promise.all(
        takers.map(async (taker) => {
            await createRandomSubmission(test, taker.id);
        })
    );
};
