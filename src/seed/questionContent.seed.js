import { faker } from "@faker-js/faker";
import { questionTypes } from "../config/questionTypes.js";
import { questionTypeToQuestionModel } from "../utils/mapping.js";

export const createQuestionContentDoc = async (questionDoc) => {
    let content;

    switch (questionDoc.type) {
        case questionTypes.MULITPLE_CHOICES:
            content = {
                question_id: questionDoc._id,
                text: faker.lorem.sentence(),
                images:
                    Math.random() > 0.5
                        ? [...Array(faker.number.int({ min: 1, max: 3 }))].map(
                              () =>
                                  faker.image.urlPicsumPhotos({
                                      width: 500,
                                      height: 500,
                                  })
                          )
                        : [],
                allow_multiple: false,
                options: [...Array(faker.number.int({ min: 2, max: 6 }))].map(
                    () => ({
                        text: faker.word.words({ min: 1, max: 10 }),
                    })
                ),
                answer: [],
                explaination: "",
            };
            break;
        case questionTypes.FILL_GAPS:
            const numGaps = faker.number.int({ min: 1, max: 3 });
            let text = faker.lorem.sentence();
            const randomPositions = Array(numGaps)
                .fill(0)
                .map(() => faker.number.int({ min: 0, max: text.length - 1 }));

            randomPositions.map((position) => {
                text =
                    text.slice(0, position) +
                    "___" +
                    text.slice(position, text.length);
            });

            content = {
                question_id: questionDoc._id,
                num_gaps: numGaps,
                text: text,
                answer: [],
                explaination: "",
            };
            break;
        case questionTypes.MATCHING:
            const numMatches = faker.number.int({ min: 2, max: 4 });

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
                answer: [],
                explaination: "",
            };
            break;
        case questionTypes.RESPONSE:
            content = {
                question_id: questionDoc._id,
                text: faker.lorem.sentence(),
                min_length: faker.number.int({ min: 1, max: 100 }),
                max_length: faker.number.int({ min: 200, max: 1000 }),
            };
            break;
        default:
            break;
    }

    const questionModel = questionTypeToQuestionModel.get(questionDoc.type);
    await questionModel.create(content);
};
