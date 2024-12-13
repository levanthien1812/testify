import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { FillGapsAnswer } from "../models/fillGapsAnswer.model.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { MatchingAnswer } from "../models/matchingAnswer.model.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";
import { MultipleChoicesAnswer } from "../models/multipleChoicesAnswer.model.js";
import { MultipleChoiceQuestion } from "../models/multipleChoicesQuestion.model.js";
import { ResponseAnswer } from "../models/responseAnswer.mode.js";
import { ResponseQuestion } from "../models/responseQuestion.model.js";

export const questionTypeToQuestionModel = new Map([
    [QUESTION_TYPE.MULTIPLE_CHOICES, MultipleChoiceQuestion],
    [QUESTION_TYPE.FILL_IN_THE_GAPS, FillGapsQuestion],
    [QUESTION_TYPE.MATCHING, MatchingQuestion],
    [QUESTION_TYPE.RESPONSE, ResponseQuestion],
]);

export const questionTypeToAnswerModel = new Map([
    [QUESTION_TYPE.MULTIPLE_CHOICES, MultipleChoicesAnswer],
    [QUESTION_TYPE.FILL_IN_THE_GAPS, FillGapsAnswer],
    [QUESTION_TYPE.MATCHING, MatchingAnswer],
    [QUESTION_TYPE.RESPONSE, ResponseAnswer],
]);
