import { faker } from "@faker-js/faker";
import {
    questionTypeToAnswerModel,
    questionTypeToQuestionModel,
} from "../utils/mapping.js";
import { isEqual } from "../utils/isEqual.js";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { Answer } from "../models/answer.model.js";
import {
    AUTO_SCORE_TYPE,
    MANUAL_SCORE_TYPE,
} from "../config/constants/constants.js";

export const createRandomAnswer = async (question, submission) => {
    const questionContentModel = questionTypeToQuestionModel.get(question.type);
    const questionContentDoc = await questionContentModel
        .findOne({
            question_id: question._id,
        })
        .select("+answer");

    const userAnswer = {
        question_id: question._id,
        submission_id: submission._id,
        date: submission.submit_time,
        is_correct: false,
        score: 0,
        skipped: false,
        evaluated: false,
    };

    let skipRate = faker.number.int({
        min: 0,
        max: 100,
    });
    let skipRateThreshold = 80;

    if (skipRate > skipRateThreshold) {
        userAnswer.skipped = true;
        userAnswer.evaluated = true;
        await Answer.create(userAnswer);
        return;
    }
    let randomAnswer;
    let correctAnswer = questionContentDoc.answer;
    let correctRate = faker.number.int({
        min: 0,
        max: 100,
    });

    switch (question.type) {
        case QUESTION_TYPE.MULTIPLE_CHOICES:
            if (questionContentDoc.options.length > 0) {
                const randomOption = faker.helpers.arrayElement(
                    questionContentDoc.options
                );
                randomAnswer = { options: [randomOption._id] };
            }
            break;
        case QUESTION_TYPE.FILL_IN_THE_GAPS:
            let gaps = [];
            for (let i = 0; i < questionContentDoc.num_gaps; i++) {
                gaps.push(faker.lorem.word());
            }
            randomAnswer = { gaps: gaps };
            break;
        case QUESTION_TYPE.MATCHING:
            let matchings = [];
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
            randomAnswer = { matchings: matchings };
            break;
        case QUESTION_TYPE.RESPONSE:
            correctAnswer = null;
            let response = faker.string.alpha({
                length: {
                    min: questionContentDoc.min_length,
                    max: questionContentDoc.max_length,
                },
            });
            randomAnswer = { response: response };
            break;
        case QUESTION_TYPE.TRUE_FALSE:
            randomAnswer = {
                is_true: faker.helpers.arrayElement([true, false]),
            };
            break;
        default:
            break;
    }

    if (correctRate > 50 && AUTO_SCORE_TYPE.includes(question.type)) {
        randomAnswer = correctAnswer;
    }

    if (
        AUTO_SCORE_TYPE.includes(question.type) &&
        isEqual(correctAnswer, randomAnswer)
    ) {
        userAnswer.is_correct = true;
        userAnswer.score = question.score;
        userAnswer.evaluated = true;
    }

    if (MANUAL_SCORE_TYPE.includes(question.type)) {
        userAnswer.score = faker.number.float({
            multipleOf: 0.25,
            min: 0,
            max: question.score,
        });
        userAnswer.evaluated = true;
    }

    const answerDoc = await Answer.create(userAnswer);

    const answerModel = questionTypeToAnswerModel.get(question.type);
    await answerModel.create({
        answer_id: answerDoc._id,
        answer: randomAnswer,
    });
};
