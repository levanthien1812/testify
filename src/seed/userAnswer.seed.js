import { faker } from "@faker-js/faker";
import {
    questionTypeToAnswerModel,
    questionTypeToQuestionModel,
} from "../utils/mapping.js";
import { isEqual } from "../utils/isEqual.js";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { Answer } from "../models/answer.model.js";
import {
    ALLOWED_PARTIAL_SCORING_TYPES,
    AUTO_SCORE_TYPE,
    FILL_GAPS_METHOD,
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
    let skipRateThreshold = 90;

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
    let isCorrect = correctRate > 70;
    let sumPartialScores = 0;
    let isAllCorrect = true;

    if (isCorrect && AUTO_SCORE_TYPE.includes(question.type)) {
        randomAnswer = correctAnswer;
        userAnswer.is_correct = true;
        userAnswer.score = question.score;
    } else {
        switch (question.type) {
            case QUESTION_TYPE.MULTIPLE_CHOICES:
                if (questionContentDoc.options.length > 0) {
                    if (!questionContentDoc.allow_multiple) {
                        const randomOption = faker.helpers.arrayElement(
                            questionContentDoc.options
                        );
                        randomAnswer = { options: [randomOption._id] };
                    } else {
                        const randomOptions = faker.helpers.arrayElements(
                            questionContentDoc.options,
                            faker.number.int({
                                min: 1,
                                max: questionContentDoc.options.length,
                            })
                        );
                        randomAnswer = {
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
                        json_text.content[0].content[i].type ===
                        "inputPlaceholder"
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
                if (question.partial_scoring) {
                    randomAnswer = {
                        gaps: correctAnswer.gaps.map((gap) => {
                            let isCorrect = faker.datatype.boolean({
                                probability: 0.6,
                            });

                            if (isCorrect) {
                                sumPartialScores +=
                                    question.score / correctAnswer.gaps.length;
                            } else {
                                isAllCorrect = false;
                            }

                            return {
                                id: gap.id,
                                text: isCorrect ? gap.text : faker.lorem.word(),
                                is_correct: isCorrect,
                            };
                        }),
                    };
                } else {
                    randomAnswer = { gaps };
                }
                break;
            case QUESTION_TYPE.MATCHING:
                if (question.partial_scoring) {
                    const suffleWrongMatchings = (matchings) => {
                        return matchings.map((matching, index) => {
                            return {
                                left: matching.left,
                                right: matchings[
                                    index === matchings.length - 1
                                        ? 0
                                        : index + 1
                                ].right,
                            };
                        });
                    };

                    let randonWrongMatchingsCount = faker.number.int({
                        min: 2,
                        max: correctAnswer.matchings.length,
                    });

                    const splitMatchings = () => {
                        const matchings = correctAnswer.matchings;
                        const correctMatchs = faker.helpers.arrayElements(
                            matchings,
                            matchings.length - randonWrongMatchingsCount
                        );

                        const remaningMatchings = matchings.filter(
                            (matching) =>
                                !correctMatchs.some(
                                    (match) => match.left === matching.left
                                )
                        );

                        const wrongMatchs =
                            suffleWrongMatchings(remaningMatchings);

                        return {
                            correctMatchings: correctMatchs,
                            wrongMatchings: wrongMatchs,
                        };
                    };

                    let { correctMatchings, wrongMatchings } = splitMatchings();

                    correctMatchings = correctMatchings.map((matching) => ({
                        ...matching,
                        is_correct: true,
                    }));

                    wrongMatchings = wrongMatchings.map((matching) => ({
                        ...matching,
                        is_correct: false,
                    }));

                    if (wrongMatchings.length > 0) isAllCorrect = false;

                    randomAnswer = {
                        matchings: [...correctMatchings, ...wrongMatchings],
                    };
                } else {
                    let matchings = [];
                    const shuffledLeftItems = faker.helpers.shuffle(
                        questionContentDoc.left_items
                    );
                    const shuffledRightItems = faker.helpers.shuffle(
                        questionContentDoc.right_items
                    );
                    for (
                        let i = 0;
                        i < questionContentDoc.left_items.length;
                        i++
                    ) {
                        matchings.push({
                            left: shuffledLeftItems[i]._id,
                            right: shuffledRightItems[i]._id,
                        });
                    }

                    randomAnswer = { matchings: matchings };
                }
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

        if (
            ALLOWED_PARTIAL_SCORING_TYPES.includes(question.type) &&
            question.partial_scoring
        ) {
            userAnswer.score = sumPartialScores;
            userAnswer.is_correct = isAllCorrect;
        } else if (
            AUTO_SCORE_TYPE.includes(question.type) &&
            isEqual(correctAnswer, randomAnswer)
        ) {
            userAnswer.is_correct = true;
            userAnswer.score = question.score;
        } else if (MANUAL_SCORE_TYPE.includes(question.type)) {
            userAnswer.score = faker.number.float({
                multipleOf: 0.25,
                min: 0,
                max: question.score,
            });
        }
    }

    userAnswer.evaluated = true;

    const answerDoc = await Answer.create(userAnswer);
    const answerModel = questionTypeToAnswerModel.get(question.type);
    await answerModel.create({
        answer_id: answerDoc._id,
        answer: randomAnswer,
    });
};
