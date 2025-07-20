import { FILL_GAPS_METHOD } from "../config/constants/constants.js";
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
                if (!questionContentDoc.allow_multiple) {
                    const randomOption = faker.helpers.arrayElement(
                        questionContentDoc.options
                    );

                    questionContentDoc.answer = { options: [randomOption._id] };
                } else {
                    const randomOptions = faker.helpers.arrayElements(
                        questionContentDoc.options,
                        faker.number.int({
                            min: 1,
                            max: questionContentDoc.options.length,
                        })
                    );
                    questionContentDoc.answer = {
                        options: randomOptions.map((option) => option._id),
                    };
                }
            }
            break;
        case QUESTION_TYPE.FILL_IN_THE_GAPS:
            const gaps = [];
            const json_text = JSON.parse(questionContentDoc.json_text);
            let remainingGivenWords = faker.helpers.shuffle(
                questionContentDoc.given_words
            );
            for (let i = 0; i < json_text.content[0].content.length; i++) {
                if (
                    json_text.content[0].content[i].type === "inputPlaceholder"
                ) {
                    if (
                        questionContentDoc.fill_method ===
                        FILL_GAPS_METHOD.INPUT
                    ) {
                        gaps.push({
                            id: json_text.content[0].content[i].attrs.id,
                            text: faker.lorem.word(),
                        });
                    } else {
                        const randomWord =
                            faker.helpers.arrayElement(remainingGivenWords);

                        gaps.push({
                            id: json_text.content[0].content[i].attrs.id,
                            text: randomWord.text,
                        });

                        remainingGivenWords = remainingGivenWords.filter(
                            (word) => word.text !== randomWord.text
                        );
                    }
                }
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
