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

        // data must include chat_id
        const emitEventToOnlineUsers = async (
            event,
            data,
            options = { includeSender: true }
        ) => {
            const chat = await Chat.findById(data.chat_id);
            if (!chat || chat.members?.length === 0) return;
            chat.members
                .filter(
                    (member) =>
                        options.includeSender ||
                        member.member.toString() !== data.sender_id
                )
                .forEach((member) => {
                    const user = onlineUsers.find(
                        (user) => user.user_id === member.member.toString()
                    );
                    if (user) {
                        io.to(user.socket_id).emit(event, data);
                    }
                });
        };

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
            await emitEventToOnlineUsers(SOCKET_EVENTS.GET_MESSAGE, message);
        });

        socket.on(SOCKET_EVENTS.DELETE_MESSAGE, async (message) => {
            await emitEventToOnlineUsers(SOCKET_EVENTS.DELETE_MESSAGE, message);
        });

        socket.on(SOCKET_EVENTS.TYPING, async (data) => {
            await emitEventToOnlineUsers(SOCKET_EVENTS.TYPING, data, {
                includeSender: false,
            });
        });

        socket.on(SOCKET_EVENTS.SEND_REACTION, async (data) => {
            await emitEventToOnlineUsers(SOCKET_EVENTS.RECEIVE_REACTION, data);
        });

        socket.on(SOCKET_EVENTS.CHANGE_NICKNAME, async (data) => {
            await emitEventToOnlineUsers(
                SOCKET_EVENTS.GET_MESSAGE,
                data.message
            );
            await emitEventToOnlineUsers(
                SOCKET_EVENTS.RECEIVE_CHANGE_NICKNAME,
                {
                    chat_id: data.message.chat_id,
                    member_id: data.memberId,
                    nickname: data.nickname,
                },
                { includeSender: false }
            );
        });

        socket.on(SOCKET_EVENTS.CHANGE_APPREARANCES, async (data) => {
            await emitEventToOnlineUsers(
                SOCKET_EVENTS.GET_MESSAGE,
                data.message
            );
            await emitEventToOnlineUsers(
                SOCKET_EVENTS.RECEIVE_CHANGE_APPREARANCES,
                {
                    chat_id: data.message.chat_id,
                    appearances: data.appearances,
                },
                { includeSender: false }
            );
        });

        socket.on(SOCKET_EVENTS.ADD_CHATS, async (data) => {
            await Promise.all(
                data.map(async (chat) => {
                    await emitEventToOnlineUsers(
                        SOCKET_EVENTS.RECEIVE_ADD_CHAT,
                        { chat_id: chat.id, chat: chat }
                    );
                })
            );
        });

        socket.on(SOCKET_EVENTS.BLOCK_USER, async (data) => {
            onlineUsers.forEach((user) => {
                if (user.user_id === data.blocked_user_id) {
                    io.to(user.socket_id).emit(
                        SOCKET_EVENTS.RECEIVE_BLOCK_USER,
                        data
                    );
                }
            });
        });

        socket.on(SOCKET_EVENTS.UNBLOCK_USER, async (data) => {
            onlineUsers.forEach((user) => {
                if (user.user_id === data.unblocked_user_id) {
                    io.to(user.socket_id).emit(
                        SOCKET_EVENTS.RECEIVE_UNBLOCK_USER,
                        data
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
