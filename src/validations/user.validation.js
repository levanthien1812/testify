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

const searchUsers = {
    query: Joi.object().keys({
        email: Joi.string().required(),
    }),
};

const updateUser = {
    body: Joi.object().keys({
        name: Joi.string(),
        email: Joi.string().email(),
        photo: Joi.string(),
        gender: Joi.string().valid("male", "female"),
        birthday: Joi.date(),
        phone_number: Joi.string(),
        password: Joi.string(),
        password_confirm: Joi.string(),
    }),
};

export default {
    getTakersDetails,
    searchUsers,
    updateUser,
};
