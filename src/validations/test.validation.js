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
    description: Joi.string(),
    num_parts: Joi.number().default(1).min(0),
    code: Joi.string(),
  }),
};

export default {
  createTest,
};
