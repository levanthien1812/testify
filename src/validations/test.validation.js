import Joi from "joi";
import { test_date } from "./custom.validation.js";
import { testLevels } from "../config/levels.js";

const createTest = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        test_date: Joi.date().required().custom(test_date),
        max_score: Joi.number().min(0).required(),
        level: Joi.string().valid(...Object.values(testLevels)),
        duration: Joi.number().min(0).required(),
        description: Joi.string().allow(null).allow(""),
        parts: Joi.array().length(0),
        code: Joi.string(),
        num_questions: Joi.number().min(1).required(),
    }),
};

const addParts = {
    body: Joi.object().keys({
        parts: Joi.array().items(
            Joi.object().keys({
                name: Joi.string().required(),
                score: Joi.number().required(),
                description: Joi.string().allow(null).allow(""),
                num_questions: Joi.number().required().min(0),
            })
        ),
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
    addParts,
    getTests
};
