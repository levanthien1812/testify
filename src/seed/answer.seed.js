import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { questionTypeToQuestionModel } from "../utils/mapping.js";
import { faker } from "@faker-js/faker";

export const createRandomAnswer = async (question) => {
    const questionContentModel = questionTypeToQuestionModel.get(question.type);
    const questionContentDoc = await questionContentModel
        .findOne({
            question_id: question._id,
        })
        .select("+answer");

    switch (question.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICES:
            if (questionContentDoc.options.length > 0) {
                const randomOption = faker.helpers.arrayElement(
                    questionContentDoc.options
                );
                questionContentDoc.answer = { options: [randomOption._id] };
            }
            break;
        case QUESTION_TYPE.FILL_IN_THE_GAPS:
            const gaps = [];
            for (let i = 0; i < questionContentDoc.num_gaps; i++) {
                gaps.push(faker.lorem.word());
            }
            questionContentDoc.answer = { gaps };
            break;
        case QUESTION_TYPE.MATCHING:
            const matchings = [];
            const shuffledLeftItems = faker.helpers.shuffle(
                questionContentDoc.left_items
            );
            const shuffledRightItems = faker.helpers.shuffle(
                questionContentDoc.right_items
            );
            for (let i = 0; i < questionContentDoc.left_items.length; i++) {
                matchings.push({
                    left: shuffledLeftItems[i]._id,
                    right: shuffledRightItems[i]._id,
                });
            }
            questionContentDoc.answer = { matchings };
            break;
        case QUESTION_TYPE.TRUE_FALSE:
            questionContentDoc.answer = {
                is_true: faker.datatype.boolean(),
            };
            break;
        default:
            break;
    }

    await questionContentDoc.save();
};
