import { Server, Socket } from "socket.io";
import config from "./config.js";

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [config.web.origin],
            methods: ["GET", "POST"],
        },
    });

    let onlineUsers = [];

    io.on("connection", (socket) => {
        console.log("a user connected");

        socket.on("add-online-users", (userId) => {
            if (!onlineUsers.some((user) => user.user_id === userId))
                onlineUsers.push({
                    user_id: userId,
                    socket_id: socket.id,
                });
            io.emit("send-online-users", onlineUsers);
            console.log("added");
        });

        socket.on("send-message", (message, receiverIds) => {
            receiverIds.forEach((receiverId) => {
                const user = onlineUsers.find(
                    (user) => user.user_id === receiverId
                );
                if (user) {
                    io.to(user.socket_id).emit("get-message", message);
                }
            });
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
            onlineUsers = onlineUsers.filter(
                (user) => user.socket_id !== socket.id
            );
            io.emit("send-online-users", onlineUsers);
        });
    });
};

export default initializeSocket;
