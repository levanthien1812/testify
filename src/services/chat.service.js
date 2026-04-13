import openai from "../config/openai.js";
import { Chat } from "../models/chat.model.js";
import { ChatAI } from "../models/chatAI.model.js";
import messageService from "./message.service.js";

const createChat = async (chatBody) => {
    const existingChat = await Chat.findOne({
        members: { $all: chatBody.members },
    });

    if (existingChat) {
        return existingChat;
    }

    const newChat = await Chat.create(chatBody);

    return await Chat.findById(newChat.id).populate(
        "members.member",
        "-password",
    );
};

const createChatAI = async (chatBody) => {
    const newChat = await ChatAI.create(chatBody);

    return newChat;
};

const updateChat = async (chatId, chatBody) => {
    const updatedChat = await Chat.findOneAndUpdate({ _id: chatId }, chatBody, {
        new: true,
    });

    return updatedChat;
};

const getChats = async (userId) => {
    const chats = await Chat.find({
        "members.member": userId,
    })
        .sort("updated_at")
        .populate("members.member", "-password -blocked_users");

    const chatsWithUnreadMessages = await Promise.all(
        chats.map(async (chat) => {
            const messages = await messageService.getMessages(chat._id);
            const lastMessage =
                messages.length > 0 ? messages[messages.length - 1] : null;

            const unreadMessages = await messageService.getUnreadMessages(
                userId,
                chat._id,
            );

            return {
                ...chat.toObject(),
                unread_messages: unreadMessages,
                last_message: lastMessage,
            };
        }),
    );

    return chatsWithUnreadMessages;
};

const updateNickname = async (chatId, { memberId, nickname }) => {
    const updatedChat = await Chat.findOneAndUpdate(
        { _id: chatId, "members.member": memberId },
        { $set: { "members.$.nick_name": nickname } },
        { new: true },
    );

    return updatedChat;
};

const getChatsAIByUserId = async (userId) => {
    const chats = await ChatAI.find({ user_id: userId });

    return chats;
};

const getModelsAI = async (userId = null) => {
    const response = await openai.models.list();
    const models = response.data;

    const allowedModels = models.filter((model) => {
        // Filter for official OpenAI models and only those intended for Chat/GPT usage
        return (
            model.owned_by === "openai" &&
            (model.id.startsWith("gpt-") || model.id.startsWith("o1-"))
        );
    });
    return allowedModels;
};

const generateAIChatName = async (messages, model) => {
    let chatName = "AI Chat";
    const systemMessage = {
        role: "system",
        content:
            "You are a helpful assistant that can summarize the topic of a conversation into a short, descriptive name (max 6 words).",
    };

    const userMessages = messages.map((message) => ({
        role: "user",
        content: message,
    }));

    const completion = await openai.chat.completions.create({
        model: model,
        messages: [systemMessage, ...userMessages],
        max_completion_tokens: 100,
    });

    chatName = completion.choices[0].message.content.replace(/"/g, "");
    return chatName;
};

const updateAIChat = async (chatId, chatBody) => {
    const updatedChat = await ChatAI.findOneAndUpdate(
        { _id: chatId },
        chatBody,
        {
            new: true,
        },
    );

    return updatedChat;
};

const deleteAIChat = async (chatId) => {
    const deletedChat = await ChatAI.findOneAndDelete({ _id: chatId });

    return deletedChat;
};

const getById = async (chatId) => {
    const chat = await Chat.findById(chatId).populate(
        "members.member",
        "-password",
    );

    return chat;
};

export default {
    createChat,
    getChats,
    updateChat,
    updateNickname,
    createChatAI,
    getChatsAIByUserId,
    getModelsAI,
    generateAIChatName,
    updateAIChat,
    deleteAIChat,
    getById,
};
