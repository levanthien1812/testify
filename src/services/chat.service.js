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
        "-password"
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
                chat._id
            );

            return {
                ...chat.toObject(),
                unread_messages: unreadMessages,
                last_message: lastMessage,
            };
        })
    );

    return chatsWithUnreadMessages;
};

const updateNickname = async (chatId, { memberId, nickname }) => {
    const updatedChat = await Chat.findOneAndUpdate(
        { _id: chatId, "members.member": memberId },
        { $set: { "members.$.nick_name": nickname } },
        { new: true }
    );

    return updatedChat;
};

const getChatsAIByUserId = async (userId) => {
    const chats = await ChatAI.find({ user_id: userId });

    return chats;
};

export default {
    createChat,
    getChats,
    updateChat,
    updateNickname,
    createChatAI,
    getChatsAIByUserId,
};
