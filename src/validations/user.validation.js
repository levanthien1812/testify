import Joi from "joi";

const getTakersDetails = {
    body: Joi.object().keys({
        taker_ids: Joi.array()
            .items(Joi.string().required())
            .required()
            .min(1)
            .messages({
                "array.base": "The ids must be an array.",
                "array.min": "The ids array must contain at least one id.",
                "string.base": "Each id must be a string.",
                "any.required": "The ids field is required.",
            }),
    }),
};

export default {
    getTakersDetails,
};
