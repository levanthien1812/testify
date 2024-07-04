import { testLevels } from "../config/levels.js";
import { logger } from "../config/logger.js";
import { publicAnswersOptions } from "../config/publicAnswerOptions.js";
import { shareOptions } from "../config/shareOptions.js";
import { testStatus } from "../config/testStatus.js";
import { Test } from "../models/test.model.js";
import { User } from "../models/user.model.js";
import { faker } from "@faker-js/faker";

const createRandomTest = async () => {
    const randomMaker = await User.aggregate([
        { $match: { role: "maker" } },
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
        Object.values(publicAnswersOptions)[
            faker.number.int({
                min: 0,
                max: Object.values(publicAnswersOptions).length - 1,
            })
        ];

    let publicAnswersDate;

    switch (publicAnswersOption) {
        case publicAnswersOptions.AFTER_CLOSE_TIME:
            publicAnswersDate = closeTime;
            break;
        case publicAnswersOptions.AFTER_TAKER_SUBMISSION:
            publicAnswersDate = closeTime;
            break;
        case publicAnswersOptions.SPECIFIC_DATE:
            publicAnswersDate = new Date(closeTime);
            publicAnswersDate.setMinutes(
                publicAnswersDate.getMinutes() +
                    faker.number.int({ min: 1, max: 1440 * 7 })
            );

            break;
    }

    const shareOption =
        shareOptions[
            faker.number.int({ min: 0, max: shareOptions.length - 1 })
        ];

    const randomTakers =
        shareOption === shareOptions.ANYONE
            ? []
            : await User.aggregate([
                  { $match: { role: "taker" } },
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
        level: Object.values(testLevels)[
            faker.number.int({
                min: 0,
                max: Object.values(testLevels).length - 1,
            })
        ],
        num_parts: numParts,
        num_questions: numQuestions,
        max_score: faker.number.int({ min: numQuestions * 0.25, max: 100 }),
        code: faker.string.alphanumeric(),
        status: testStatus.DRAFT,
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
