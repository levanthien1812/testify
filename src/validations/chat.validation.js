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

const updateMessageAI = {
    body: Joi.object().keys({
        model: Joi.string().required(),
        content: Joi.object().keys({
            text: Joi.string().required(),
        }),
    }),
};

const createMockMessageAI = {
    body: Joi.object().keys({
        content: Joi.object().keys({
            text: Joi.string().required(),
        }),
        delay: Joi.number().required().min(1000).max(10000),
    }),
};

const getMessages = {
    query: Joi.object().keys({
        oldestMessageId: Joi.string().optional(),
        limit: Joi.number().required(),
    }),
};

const updateChatAI = {
    body: Joi.object().keys({
        chat_name: Joi.string().optional(),
        is_pinned: Joi.boolean().optional(),
    }),
};

export default {
    createChat,
    createMessageAI,
    createChatAI,
    getMessages,
    createMockMessageAI,
    updateMessageAI,
    updateChatAI,
};
