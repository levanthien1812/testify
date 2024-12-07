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

const getUnreadMessages = async (userId, chatId) => {
    const unreadMessages = await Message.find({
        sender_id: userId,
        chat_id: chatId,
        readBy: { $ne: userId },
    }).sort("created_at");

    return unreadMessages;
};

export default {
    createMessage,
    getMessages,
    getUnreadMessages,
};
