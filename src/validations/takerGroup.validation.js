import Joi from "joi";

const createTakerGroup = Joi.object().keys({
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        takers: Joi.array().items(Joi.string()).optional(),
    }),
});

const updateTakerGroup = Joi.object().keys({
    body: Joi.object().keys({
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        takers: Joi.array().items(Joi.string()).optional(),
    }),
});

export default { createTakerGroup, updateTakerGroup };
