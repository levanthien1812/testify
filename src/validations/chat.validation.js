import Joi from "joi";
import { CHAT_OPTION } from "../config/constants/constants.js";

const createChat = {
    query: Joi.object().keys({
        option: Joi.string()
            .required()
            .valid(...Object.values(CHAT_OPTION)),
    }),
};

const createChatAI = {
    body: Joi.object().keys({
        chat_name: Joi.string().required(),
    }),
};

const createMessageAI = {
    body: Joi.object().keys({
        text: Joi.string().required(),
    }),
};

export default {
    createChat,
    createMessageAI,
    createChatAI,
};
