import { questionTypes } from "../config/questionTypes.js";
import { FillGapsQuestion } from "../models/fillGapsQuestion.model.js";
import { MatchingQuestion } from "../models/matchingQuestion.model.js";
import { MultipleChoiceQuestion } from "../models/multipleChoicesQuestion.model.js";

export const questionTypeToModel = new Map([
    [questionTypes.MULITPLE_CHOICES, MultipleChoiceQuestion],
    [questionTypes.FILL_GAPS, FillGapsQuestion],
    [questionTypes.MATCHING, MatchingQuestion],
]);