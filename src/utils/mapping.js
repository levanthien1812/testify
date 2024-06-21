import { questionTypes } from "../config/questionTypes.js";
import { FillGapsAnswer } from "../models/fillGapsAnswer.model.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { MatchingAnswer } from "../models/matchingAnswer.model.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";
import { MultipleChoicesAnswer } from "../models/multipleChoicesAnswer.model.js";
import { MultipleChoiceQuestion } from "../models/multipleChoicesQuestion.model.js";
import { ResponseAnswer } from "../models/responseAnswer.mode.js";
import { ResponseQuestion } from "../models/responseQuestion.model.js";

export const questionTypeToQuestionModel = new Map([
    [questionTypes.MULITPLE_CHOICES, MultipleChoiceQuestion],
    [questionTypes.FILL_GAPS, FillGapsQuestion],
    [questionTypes.MATCHING, MatchingQuestion],
    [questionTypes.RESPONSE, ResponseQuestion],
]);

export const questionTypeToAnswerModel = new Map([
    [questionTypes.MULITPLE_CHOICES, MultipleChoicesAnswer],
    [questionTypes.FILL_GAPS, FillGapsAnswer],
    [questionTypes.MATCHING, MatchingAnswer],
    [questionTypes.RESPONSE, ResponseAnswer],
]);