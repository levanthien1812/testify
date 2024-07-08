import { Chat } from "../models/chat.model.js";

const createChat = async (chatBody) => {
    const existingChat = await Chat.findOne({
        members: { $all: chatBody.members },
    });

    if (existingChat) {
        return existingChat;
    }

    const newChat = await Chat.create(chatBody);
    return newChat;
};

const getChats = async (userId) => {
    const chats = await Chat.find({
        "members.member": userId,
    })
        .sort("updated_at")
        .populate("members.member", "-password");

    return chats;
};

export default { createChat, getChats };
