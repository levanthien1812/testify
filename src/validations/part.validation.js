import Joi from "joi";

const addPart = {
    body: Joi.object().keys({
        order: Joi.number().required().min(1),
        name: Joi.string().required(),
        score: Joi.number().required(),
        description: Joi.string().allow(null).allow(""),
        num_questions: Joi.number().required().min(0),
    }),
    params: Joi.object().keys({
        testId: Joi.string().required(),
    }),
};

const updatePart = {
    body: Joi.object().keys({
        order: Joi.number().optional().min(1),
        name: Joi.string().optional(),
        score: Joi.number().optional(),
        description: Joi.string().allow(null).allow(""),
        num_questions: Joi.number().optional().min(0),
    }),
    params: Joi.object().keys({
        testId: Joi.string().optional(),
        partId: Joi.string().required(),
    }),
};

const movePart = {
    direction: Joi.string().required().valid("up", "down"),
    params: Joi.object().keys({
        testId: Joi.string().optional(),
        partId: Joi.string().required(),
    }),
};

export default { addPart, updatePart, movePart };
