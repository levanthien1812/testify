import Joi from "joi";
import { datetime } from "./custom.validation.js";
import { testLevels } from "../config/levels.js";
import { publicAnswersOptions } from "../config/publicAnswerOptions.js";

const createTest = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        datetime: Joi.date().required().custom(datetime),
        max_score: Joi.number().min(0).required(),
        level: Joi.string().valid(...Object.values(testLevels)),
        duration: Joi.number().min(0).required(),
        description: Joi.string().allow(null).allow(""),
        parts: Joi.array().length(0),
        code: Joi.string().allow(""),
        num_questions: Joi.number().min(1).required(),
        num_parts: Joi.number().min(1).default(1),
        close_time: Joi.date().optional(),
        public_answers_option: Joi.string().valid(
            ...Object.values(publicAnswersOptions)
        ),
        public_answers_date: Joi.date().optional(),
    }),
};

const getTests = {
    query: Joi.object().keys({
        finish: Joi.string().optional(),
        date_from: Joi.string().optional(),
        date_to: Joi.string().optional(),
        search: Joi.string().optional(),
        sort: Joi.string().optional(),
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
    }),
};

export default {
    createTest,
    getTests,
};
