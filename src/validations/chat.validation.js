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
        first_message: Joi.string().required(),
        model: Joi.string().required(),
    }),
};

const createMessageAI = {
    body: Joi.object().keys({
        model: Joi.string().required(),
        content: Joi.object().keys({
            text: Joi.string().required(),
        }),
    }),
};

const getMessages = {
    query: Joi.object().keys({
        oldestMessageId: Joi.string().optional(),
        limit: Joi.number().required(),
    }),
};

export default {
    createChat,
    createMessageAI,
    createChatAI,
    getMessages,
};
