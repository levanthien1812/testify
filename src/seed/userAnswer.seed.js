import { faker } from "@faker-js/faker";
import {
    questionTypeToAnswerModel,
    questionTypeToQuestionModel,
} from "../utils/mapping.js";
import { sameItems } from "../utils/isEqual.js";
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
    };

    let answer;
    switch (question.type) {
        case QUESTION_TYPE.MULITPLE_CHOICES:
            answer = [];
            if (questionContentDoc.options.length > 0) {
                const randomOption = faker.helpers.arrayElement(
                    questionContentDoc.options
                );
                answer = [randomOption._id];
            }
            break;
        case QUESTION_TYPE.FILL_GAPS:
            answer = [];
            for (let i = 0; i < questionContentDoc.num_gaps; i++) {
                answer.push(faker.lorem.word());
            }
            break;
        case QUESTION_TYPE.MATCHING:
            answer = [];
            const shuffledLeftItems = faker.helpers.shuffle(
                questionContentDoc.left_items
            );
            const shuffledRightItems = faker.helpers.shuffle(
                questionContentDoc.right_items
            );
            for (let i = 0; i < questionContentDoc.left_items.length; i++) {
                answer.push({
                    left: shuffledLeftItems[i]._id,
                    right: shuffledRightItems[i]._id,
                });
            }
            break;
        case QUESTION_TYPE.RESPONSE:
            answer = faker.string.alpha({
                length: {
                    min: questionContentDoc.min_length,
                    max: questionContentDoc.max_length,
                },
            });
            break;
        default:
            break;
    }

    if (
        AUTO_SCORE_TYPE.includes(question.type) &&
        sameItems(
            answer,
            questionContentDoc.answer,
            question.type === QUESTION_TYPE.FILL_GAPS
        )
    ) {
        userAnswer.is_correct = true;
        userAnswer.score = question.score;
    }

    if (MANUAL_SCORE_TYPE.includes(question.type)) {
        userAnswer.score = faker.number.float({
            multipleOf: 0.25,
            min: 0,
            max: question.score,
        });
        userAnswer.is_correct = userAnswer.score > 0;
    }

    const answerDoc = await Answer.create(userAnswer);

    const answerModel = questionTypeToAnswerModel.get(question.type);
    await answerModel.create({
        answer_id: answerDoc._id,
        answer: answer,
    });
};
