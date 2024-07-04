import { questionTypes } from "../config/questionTypes.js";
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
        case questionTypes.MULITPLE_CHOICES:
            if (questionContentDoc.options.length > 0) {
                const randomOption = faker.helpers.arrayElement(
                    questionContentDoc.options
                );
                questionContentDoc.answer = [randomOption._id];
                await questionContentDoc.save();
            }
            break;
        case questionTypes.FILL_GAPS:
            for (let i = 0; i < questionContentDoc.num_gaps; i++) {
                if (!questionContentDoc.answer) questionContentDoc.answer = [];
                questionContentDoc.answer.push(faker.lorem.word());
                await questionContentDoc.save();
            }
            break;
        case questionTypes.MATCHING:
            const shuffledLeftItems = faker.helpers.shuffle(
                questionContentDoc.left_items
            );
            const shuffledRightItems = faker.helpers.shuffle(
                questionContentDoc.right_items
            );
            for (let i = 0; i < questionContentDoc.left_items.length; i++) {
                if (!questionContentDoc.answer) questionContentDoc.answer = [];
                questionContentDoc.answer.push({
                    left: shuffledLeftItems[i]._id,
                    right: shuffledRightItems[i]._id,
                });
                await questionContentDoc.save();
            }
            break;
        default:
            break;
    }
};
