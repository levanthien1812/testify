import openai from "../config/openai.js";
import { Message } from "../models/message.model.js";
import { MessageAI } from "../models/messageAI.model.js";
import { generateLinkPreviews } from "../utils/linkImage.js";

const createMessage = async (messageBody) => {
    const message = await Message.create({
        ...messageBody,
    });

    return (await generateLinkPreviews([message]))[0];
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
    return (await generateLinkPreviews([message]))[0];
};

const getMessages = async (chatId, reqQuery = {}) => {
    const filter = { chat_id: chatId };
    const query = { sortBy: "created_at:desc" };
    if (reqQuery.page) query.page = reqQuery.page;
    if (reqQuery.limit) query.limit = reqQuery.limit;

    const { results: messages, ...rest } = await Message.paginate(
        filter,
        query
    );

    return await generateLinkPreviews(messages.reverse());
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

const getMessagesAIByChatId = async (chatId) => {
    const messages = await MessageAI.find({ chat_id: chatId });
    return messages;
};

const createMessageAI = async (chatId, messageBody) => {
    const userMessage = await MessageAI.create({
        chat_id: chatId,
        content: messageBody.text,
        role: "user",
    });

    const prevMessages = await getMessagesAIByChatId(chatId);
    const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: prevMessages,
    });

    let assistantMessage = null;
    if (completion.choices && completion.choices.length > 0) {
        assistantMessage = await MessageAI.create({
            chat_id: chatId,
            content: completion.choices[0].message.content,
            role: "assistant",
        });
    }

    return {
        userMessage,
        assistantMessage,
    };
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
    createMessageAI,
};
