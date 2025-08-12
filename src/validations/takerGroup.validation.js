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

const addTakersToGroup = Joi.object().keys({
    body: Joi.object().keys({
        selectedGroup: Joi.string().required(),
        takerIds: Joi.array().items(Joi.string()).required(),
        removeCurrentGroup: Joi.boolean().optional(),
    }),
});

export default { createTakerGroup, updateTakerGroup, addTakersToGroup };
