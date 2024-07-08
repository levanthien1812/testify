import { Server, Socket } from "socket.io";
import config from "./config.js";

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: config.web.origin,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("a user connected");

        socket.on("chat message", (msg) => {
            console.log("message: " + msg);
            io.emit("chat message", msg);
        });

        socket.on("disconnect", () => {
            console.log("a user disconnected");
        });
    });
};

export default initializeSocket;
