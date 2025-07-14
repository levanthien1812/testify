import { faker } from "@faker-js/faker";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { questionTypeToQuestionModel } from "../utils/mapping.js";
import { FILL_GAP_INDICATOR } from "../config/constants/constants.js";

export const createQuestionContentDoc = async (questionDoc) => {
    let content;

    switch (questionDoc.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICES:
            content = {
                question_id: questionDoc._id,
                text: faker.lorem.sentence(),
                allow_multiple: false,
                options: [...Array(faker.number.int({ min: 2, max: 6 }))].map(
                    () => ({
                        text: faker.word.words({ min: 1, max: 10 }),
                    })
                ),
            };
            break;
        case QUESTION_TYPE.FILL_IN_THE_GAPS:
            const numGaps = faker.number.int({ min: 1, max: 5 });
            let text = faker.lorem.sentence();
            const randomPositions = Array(numGaps)
                .fill(0)
                .map(() => faker.number.int({ min: 0, max: text.length - 1 }));

            randomPositions.map((position) => {
                text =
                    text.slice(0, position) +
                    FILL_GAP_INDICATOR +
                    text.slice(position, text.length);
            });

            content = {
                question_id: questionDoc._id,
                num_gaps: numGaps,
                text: text,
            };
            break;
        case QUESTION_TYPE.MATCHING:
            const numMatches = faker.number.int({ min: 2, max: 6 });

            let leftItems = [],
                rightItems = [];
            for (let i = 0; i < numMatches; i++) {
                leftItems.push({
                    text: faker.lorem.sentence(),
                });
                rightItems.push({
                    text: faker.lorem.sentence(),
                });
            }

            content = {
                text: faker.lorem.sentence(),
                question_id: questionDoc._id,
                left_items: leftItems,
                right_items: rightItems,
            };
            break;
        case QUESTION_TYPE.RESPONSE:
            content = {
                question_id: questionDoc._id,
                text: faker.lorem.sentence(),
                min_length: faker.number.int({ min: 1, max: 100 }),
                max_length: faker.number.int({ min: 200, max: 1000 }),
            };
            break;
        case QUESTION_TYPE.TRUE_FALSE:
            content = {
                question_id: questionDoc._id,
                text: faker.lorem.sentence(),
            };
            break;
        default:
            break;
    }

    const questionModel = questionTypeToQuestionModel.get(questionDoc.type);
    await questionModel.create(content);
};
