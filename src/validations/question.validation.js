import Joi from "joi";
import { QUESTION_TYPE } from "../config/constants/questionTypes.js";
import { QUESTION_LEVEL } from "../config/constants/levels.js";

const createTestQuestion = {
    body: Joi.object().keys({
        order: Joi.number().required(),
        type: Joi.string()
            .optional()
            .valid(...Object.values(QUESTION_TYPE)),
        score: Joi.number().required(),
        question: Joi.string().required(),
        level: Joi.string()
            .optional()
            .valid(...Object.values(QUESTION_LEVEL)),
        content: Joi.object().required(),
    }),
};

export default { createTestQuestion };
