import Joi from "joi";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { QUESTION_LEVEL } from "../config/constants/levels.js";

const createQuestionBank = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
    is_bookmarked: Joi.boolean().optional(),
});

const createQuestion = Joi.object().keys({
    type: Joi.string()
        .required()
        .valid(...Object.values(QUESTION_TYPE)),
    level: Joi.string()
        .optional()
        .valid(...Object.values(QUESTION_LEVEL)),
    score: Joi.number().optional(),
    content: Joi.object().required(),
});

const importQuestionsToBank = Joi.object().keys({
    questions: Joi.array().items(Joi.string()).required(),
});

export default { createQuestionBank, createQuestion, importQuestionsToBank };
