import Joi from "joi";
import {
    CHAT_REQUEST_STATUS,
    CHAT_REQUEST_TYPE,
} from "../config/constants/chat.js";

const getChatRequests = {
    query: {
        type: Joi.string()
            .required()
            .valid(...Object.values(CHAT_REQUEST_TYPE)),
        status: Joi.string()
            .optional()
            .valid(...Object.values(CHAT_REQUEST_STATUS)),
    },
};

export default { getChatRequests };
