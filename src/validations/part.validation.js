import Joi from "joi";

const addPart = {
    body: Joi.object().keys({
        order: Joi.number().required().min(1),
        name: Joi.string().required(),
        score: Joi.number().required(),
        description: Joi.string().allow(null).allow(""),
        num_questions: Joi.number().required().min(0),
    }),
};

export default { addPart };
