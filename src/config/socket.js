import { Server, Socket } from "socket.io";
import config from "./config.js";
import { SOCKET_EVENTS } from "./constants/socket.js";
import { Chat } from "../models/chat.model.js";

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [config.web.origin],
            methods: ["GET", "POST"],
        },
        maxHttpBufferSize: 1e8,
    });

    let onlineUsers = [];

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        console.log("a user connected");

        socket.on(SOCKET_EVENTS.JOIN_CHAT, (chatId) => {
            console.log(`User ${socket.id} joined chat ${chatId}`);
            socket.join(chatId);
        });

        socket.on(SOCKET_EVENTS.ADD_ONLINE_USERS, (userId) => {
            if (!onlineUsers.some((user) => user.user_id === userId))
                onlineUsers.push({
                    user_id: userId,
                    socket_id: socket.id,
                });
            io.emit(SOCKET_EVENTS.SEND_ONLINE_USERS, onlineUsers);
        });

        socket.on(SOCKET_EVENTS.REMOVE_ONLINE_USERS, (userId) => {
            const updatedOnlineUsers = onlineUsers.filter(
                (user) =>
                    user.user_id !== userId && user.socket_id === socket.id
            );
            io.emit(SOCKET_EVENTS.SEND_ONLINE_USERS, updatedOnlineUsers);
        });

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (message) => {
            const chat = await Chat.findById(message.chat_id);
            if (!chat || chat.members?.length === 0) return;
            chat.members.forEach((member) => {
                const user = onlineUsers.find(
                    (user) => user.user_id === member.member.toString()
                );
                if (user) {
                    io.to(user.socket_id).emit(
                        SOCKET_EVENTS.GET_MESSAGE,
                        message
                    );
                }
            });
        });

        socket.on(SOCKET_EVENTS.DELETE_MESSAGE, async (message) => {
            const chat = await Chat.findById(message.chat_id);
            if (!chat || chat.members?.length === 0) return;
            chat.members.forEach((member) => {
                const user = onlineUsers.find(
                    (user) => user.user_id === member.member.toString()
                );
                if (user) {
                    io.to(user.socket_id).emit(
                        SOCKET_EVENTS.DELETE_MESSAGE,
                        message
                    );
                }
            });
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            console.log("user disconnected");
            onlineUsers = onlineUsers.filter(
                (user) => user.socket_id !== socket.id
            );
            io.emit(SOCKET_EVENTS.SEND_ONLINE_USERS, onlineUsers);
        });
    });
};

export default initializeSocket;
