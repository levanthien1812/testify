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

const getMessages = async (chatId, options = {}) => {
    const { oldestMessageId, limit } = options;

    const filter = {
        chat_id: chatId,
        ...(oldestMessageId ? { _id: { $lt: oldestMessageId } } : {}),
    };

    console.log(filter);

    const messages = await Message.find(filter).sort({ _id: -1 }).limit(limit);

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

const generateMessageAI = async (model, prevMessages) => {
    const completion = await openai.chat.completions.create({
        model: model,
        messages: prevMessages,
    });

    if (completion.choices && completion.choices.length > 0) {
        return completion.choices[0].message.content;
    } else {
        return null;
    }
};

const createMessageAI = async (chatId, model, messageContent) => {
    const userMessage = await MessageAI.create({
        chat_id: chatId,
        content: messageContent.text,
        role: "user",
    });

    const prevMessages = await getMessagesAIByChatId(chatId);

    const assistantMessage = await MessageAI.create({
        chat_id: chatId,
        content: await generateMessageAI(model, prevMessages),
        role: "assistant",
        reply_to: userMessage.id,
    });

    return {
        userMessage,
        assistantMessage,
    };
};

const createMockMessageAI = async (chatId, messageContent, delay = 1000) => {
    const fixedResponseMessage = "This is a mock AI response.";

    const userMessage = {
        chat_id: chatId,
        content: messageContent.text,
        role: "user",
        id: Math.random().toString(36).substring(4),
    };

    const assistantMessage = {
        chat_id: chatId,
        content: fixedResponseMessage,
        role: "assistant",
        id: Math.random().toString(36).substring(4),
        reply_to: userMessage.id,
    };

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                userMessage,
                assistantMessage,
            });
        }, delay);
    });
};

const updateMessageAI = async (chatId, model, messageId, messageContent) => {
    const userMessage = await MessageAI.findByIdAndUpdate(
        messageId,
        {
            content: messageContent.text,
        },
        {
            new: true,
        }
    );

    const prevMessages = await getMessagesAIByChatId(chatId);

    const assistantMessage = await MessageAI.findOneAndUpdate(
        {
            chat_id: chatId,
            reply_to: messageId,
        },
        {
            content: await generateMessageAI(model, prevMessages),
        },
        {
            new: true,
        }
    );

    return {
        userMessage,
        assistantMessage,
    };
};

const regenerateMessageAI = async (chatId, model, messageId) => {
    await MessageAI.deleteOne({
        chat_id: chatId,
        reply_to: messageId,
    });

    const prevMessages = await getMessagesAIByChatId(chatId);

    const assistantMessage = await MessageAI.create({
        chat_id: chatId,
        content: await generateMessageAI(model, prevMessages),
        role: "assistant",
        reply_to: messageId,
    });

    return {
        assistantMessage,
    };
};

const deleteAIMessagesByChatId = async (chatId) => {
    const messages = await MessageAI.deleteMany({ chat_id: chatId });
    return messages;
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
    getMessagesAIByChatId,
    createMockMessageAI,
    updateMessageAI,
    regenerateMessageAI,
    deleteAIMessagesByChatId,
};
