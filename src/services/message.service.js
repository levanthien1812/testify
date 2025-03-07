import { Message } from "../models/message.model.js";

const createMessage = async (messageBody) => {
    const message = await Message.create({
        ...messageBody,
    });
    return message;
};

const updateMessage = async (messageId, messageBody) => {
    const message = await Message.findByIdAndUpdate(
        messageId,
        {
            ...messageBody,
        },
        {
            new: true,
        }
    );
    return message;
};

const getMessages = async (chatId, reqQuery = {}) => {
    const filter = { chat_id: chatId };
    const query = { sortBy: "created_at:desc" };
    if (reqQuery.page) query.page = reqQuery.page;
    if (reqQuery.limit) query.limit = reqQuery.limit;

    console.log({ query });

    const { results: messages, ...rest } = await Message.paginate(
        filter,
        query
    );

    return messages.reverse();
};

const getUnreadMessages = async (userId, chatId) => {
    const unreadMessages = await Message.find({
        // sender_id: userId,
        chat_id: chatId,
        is_read: false,
        deleted: false,
    }).sort("created_at");

    return unreadMessages;
};

const updateMessagesReadByByChatId = async (chatId, readBy) => {
    // the logic for updating read field will be more complicated in case group chat
    const messages = await Message.updateMany(
        { chat_id: chatId },
        { $addToSet: { read_by: readBy } },
        { new: true }
    );
    return messages;
};

const deleteMessage = async (id) => {
    const message = await Message.findByIdAndUpdate(
        id,
        {
            deleted: true,
        },
        {
            new: true,
        }
    );
    return message;
};

const getMessageById = async (id) => {
    const message = await Message.findById(id);
    return message;
};

const pushRemoveFor = async (messageId, valueToPush) => {
    const message = await Message.findByIdAndUpdate(
        messageId,
        {
            $addToSet: {
                removed_for: valueToPush,
            },
        },
        {
            new: true,
        }
    );
    return message;
};

export default {
    createMessage,
    updateMessage,
    getMessages,
    getUnreadMessages,
    updateMessagesReadByByChatId,
    deleteMessage,
    getMessageById,
    pushRemoveFor,
};
