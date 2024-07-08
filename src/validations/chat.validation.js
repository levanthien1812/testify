import Joi from "joi";
import { chatOptions } from "../config/constants.js";

const createChat = {
    query: Joi.object().keys({
        option: Joi.string()
            .required()
            .valid(...Object.values(chatOptions)),
    }),
};

export default {
    createChat,
};
