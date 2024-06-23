import Joi from "joi";

const updateAnswerSchema = {
    body: Joi.object().keys({
        score: Joi.number().min(0).required(),
    }),
};

export default { updateAnswerSchema };
