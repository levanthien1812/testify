import { Chat } from "../models/chat.model.js";
import messageService from "./message.service.js";

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

export default { createChat, getChats };
