import { Message } from "../models/message.model.js";

const createMessage = async (messageBody) => {
    const message = await Message.create({
        ...messageBody,
    });
    return message;
};

const getMessages = async (chatId) => {
    const messages = await Message.find({ chat_id: chatId });
    return messages;
};

export default {
    createMessage,
    getMessages,
};
