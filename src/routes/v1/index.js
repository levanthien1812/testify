import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import testRoute from "./test.route.js";
import chatRoute from "./chat.route.js";
import questionBankRoute from "./questionBank.route.js";
import notificationRoute from "./notification.route.js";
import chatRequestRoute from "./chatRequest.route.js";
import express from "express";

const router = express.Router();

const routes = [
    {
        path: "/auth",
        route: authRoute,
    },
    {
        path: "/users",
        route: userRoute,
    },
    {
        path: "/tests",
        route: testRoute,
    },
    {
        path: "/chats",
        route: chatRoute,
    },
    {
        path: "/question-banks",
        route: questionBankRoute,
    },
    {
        path: "/notifications",
        route: notificationRoute,
    },
    { path: "/chat-requests", route: chatRequestRoute },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
