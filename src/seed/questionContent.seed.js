import { faker } from "@faker-js/faker";
import {
    QUESTION_INSTRUCTIONS,
    QUESTION_TYPE,
} from "../config/constants/questionTypes.js";
import { questionTypeToQuestionModel } from "../utils/mapping.js";
import {
    FILL_GAP_INDICATOR,
    FILL_GAPS_METHOD,
} from "../config/constants/constants.js";

function generateTipTapDoc(numOfGaps) {
    const content = [];

    for (let i = 0; i < numOfGaps; i++) {
        // Add random text before the gap
        content.push({
            type: "text",
            text: faker.lorem.words({ min: 1, max: 3 }),
        });

        // Add a gap (inputPlaceholder)
        content.push({
            type: "inputPlaceholder",
            text: "",
            attrs: {
                id: `gap-${i + 1}`,
            },
        });
    }

    // Optional: end with more text
    content.push({
        type: "text",
        text: faker.lorem.words({ min: 1, max: 3 }),
    });

    return {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content,
            },
        ],
    };
}

function convertDocToSentence(doc, gapLabel = FILL_GAP_INDICATOR) {
    if (
        !doc ||
        doc.type !== "doc" ||
        !Array.isArray(doc.content) ||
        !Array.isArray(doc.content[0]?.content)
    ) {
        throw new Error("Invalid Tiptap doc structure.");
    }

    const paragraph = doc.content[0].content;

    return paragraph
        .map((node) => {
            if (node.type === "text") {
                return node.text;
            }
            if (node.type === "inputPlaceholder") {
                return gapLabel;
            }
            return "";
        })
        .join(" ")
        .replace(/\s+([,.!?;:])/g, "$1") // clean up spaces before punctuation
        .replace(/\s+/g, " ") // normalize spaces
        .trim();
}

export const createQuestionContentDoc = async (questionDoc) => {
    let content;

    switch (questionDoc.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICES:
            const allowMultiple = faker.datatype.boolean();

            content = {
                question_id: questionDoc._id,
                text: faker.lorem.sentence(),
                instruction_text: !allowMultiple
                    ? QUESTION_INSTRUCTIONS.MULTIPLE_CHOICES_SINGLE
                    : QUESTION_INSTRUCTIONS.MULTIPLE_CHOICES_MULTIPLE,
                allow_multiple: allowMultiple,
                options: [...Array(faker.number.int({ min: 2, max: 6 }))].map(
                    () => ({
                        text: faker.word.words({ min: 1, max: 10 }),
                    })
                ),
            };
            break;
        case QUESTION_TYPE.FILL_IN_THE_GAPS:
            const numGaps = faker.number.int({ min: 1, max: 5 });
            const method = faker.helpers.arrayElement(
                Object.values(FILL_GAPS_METHOD)
            );
            const json_text = generateTipTapDoc(numGaps);
            const text = convertDocToSentence(json_text);
            let given_words = [];

            if (method === FILL_GAPS_METHOD.DRAG_DROP) {
                const additionalNoOfWords = faker.number.int({
                    min: 1,
                    max: 5,
                });
                for (let i = 0; i < numGaps + additionalNoOfWords; i++) {
                    given_words.push({
                        text: faker.lorem.word(),
                    });
                }
            }

            content = {
                question_id: questionDoc._id,
                num_gaps: numGaps,
                text: text,
                instruction_text: QUESTION_INSTRUCTIONS.FILL_IN_THE_GAPS,
                fill_method: method,
                given_words: given_words,
                json_text: JSON.stringify(json_text),
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
                instruction_text: QUESTION_INSTRUCTIONS.MATCHING,
                question_id: questionDoc._id,
                left_items: leftItems,
                right_items: rightItems,
            };
            break;
        case QUESTION_TYPE.RESPONSE:
            content = {
                question_id: questionDoc._id,
                text: faker.lorem.sentence(),
                instruction_text: QUESTION_INSTRUCTIONS.RESPONSE,
                min_length: faker.number.int({ min: 1, max: 100 }),
                max_length: faker.number.int({ min: 200, max: 1000 }),
            };
            break;
        case QUESTION_TYPE.TRUE_FALSE:
            content = {
                question_id: questionDoc._id,
                text: faker.lorem.sentence(),
                instruction_text: QUESTION_INSTRUCTIONS.TRUE_FALSE,
            };
            break;
        default:
            break;
    }

    const questionModel = questionTypeToQuestionModel.get(questionDoc.type);
    await questionModel.create(content);
};
