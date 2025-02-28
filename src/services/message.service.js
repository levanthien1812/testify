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
        // sender_id: userId,
        chat_id: chatId,
        read_by: { $nin: [userId] },
    }).sort("created_at");

    return unreadMessages;
};

const updateMessagesReadByByChatId = async (chatId, readBy) => {
    // the logic for updating read field will be more complicated in case group chat
    const messages = await Message.updateMany(
        { chat_id: chatId },
        { $addToSet: { read_by: { $each: readBy } } },
        { new: true }
    );
    return messages;
};

const deleteMessage = async (id) => {
    const message = await Message.findByIdAndDelete(id);
    return message;
};

export default {
    createMessage,
    getMessages,
    getUnreadMessages,
    updateMessagesReadByByChatId,
    deleteMessage,
};
