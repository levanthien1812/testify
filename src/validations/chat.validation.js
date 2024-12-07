import Joi from "joi";
import { CHAT_OPTION } from "../config/constants/constants.js";

const createChat = {
    query: Joi.object().keys({
        option: Joi.string()
            .required()
            .valid(...Object.values(CHAT_OPTION)),
    }),
};

export default {
    createChat,
};
