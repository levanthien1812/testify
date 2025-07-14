import { TEST_LEVEL } from "../config/constants/levels.js";
import { logger } from "../config/logger.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import { Test } from "../models/test.model.js";
import { faker } from "@faker-js/faker";
import { mockSubmissions } from "./submission.seed.js";
import { PAGINATION_MODE } from "../config/constants/test.js";
import { Taker } from "../models/taker.model.js";
import { Maker } from "../models/maker.model.js";
import passcodeService from "../services/passcode.service.js";
import { seedParts } from "./part.seed.js";
import { seedQuestions } from "./question.seed.js";
import { getRandomPasscode } from "./passcode.seed.js";
import testService from "../services/test.service.js";

const testOptions = {
    allow_close_time: {
        enable: false,
        let_taker_know: true,
    },
    allow_view_submission_after_test: {
        enable: true,
        let_taker_know: true,
    },
    allow_multiple_submissions: {
        enable: false,
        let_taker_know: true,
        maximum_submissions: 3,
    },
    allow_save_progress: {
        enable: false,
        let_taker_know: true,
    },
    allow_show_taker_answers_after_test: {
        enable: false,
        let_taker_know: false,
    },
    allow_show_maker_answers_after_test: {
        enable: true,
        let_taker_know: false,
        public_answers_option: PUBLIC_ANSWER_OPTION.AFTER_TAKER_SUBMISSION,
    },
    allow_shuffle_questions: {
        enable: false,
        let_taker_know: false,
    },
    allow_shuffle_answers: {
        enable: false,
        let_taker_know: false,
    },
    allow_review_before_submission: {
        enable: false,
        let_taker_know: false,
    },
    disallow_time_limit: {
        enable: false,
        let_taker_know: true,
    },
    pagination_mode: {
        enable: false,
        let_taker_know: false,
        mode: PAGINATION_MODE.ONE_QUESTION,
        allow_back_navigation: false,
        require_completion_before_next: false,
        questions_per_page: 10,
    },
};

const createRandomTest = async () => {
    const randomMaker = await Maker.aggregate([
        {
            $sample: {
                size: 1,
            },
        },
    ]);

    const numParts = faker.number.int({ min: 1, max: 4 });
    const numQuestions = faker.number.int({ min: numParts, max: 40 });

    const datetime = faker.date.soon({ days: 4 });

    const shareOption = faker.helpers.arrayElement([
        SHARE_OPTION.RESTRICTED,
        SHARE_OPTION.PASSCODE,
    ]);

    let takers = [];
    let passcode = null;

    switch (shareOption) {
        case SHARE_OPTION.RESTRICTED:
            takers = await Taker.aggregate([
                { $match: { maker_id: randomMaker[0]._id } },
                {
                    $sample: {
                        size: faker.number.int({ min: 5, max: 40 }),
                    },
                },
            ]);
            break;
        case SHARE_OPTION.PASSCODE:
            passcode = await passcodeService.createPasscode(
                getRandomPasscode()
            );
            break;
        default:
            break;
    }

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
        share_option: shareOption,
        are_answers_provided: false,
        taker_ids: takers.map((taker) => taker._id),
        passcode_id: passcode ? passcode._id : null,
        options: testOptions,
        includes_manually_scored_questions: false,
    };
};

export const seedTests = async () => {
    logger.info("Seeding tests...");

    await Promise.all(
        [...Array(40)].map(async () => {
            const randomTest = await createRandomTest();
            const test = await Test.create(randomTest);

            await seedParts(test.id);
            await seedQuestions(test.id);

            await testService.publishTest(test.id);
            await mockSubmissions(test.id);
        })
    );

    logger.info("Seed tests done");
};
