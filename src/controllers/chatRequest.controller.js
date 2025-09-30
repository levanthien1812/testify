import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import chatRequestService from "../services/chatRequest.service.js";
import notificationService from "../services/notification.service.js";
import { getIO } from "../config/socket.js";
import { SOCKET_EVENTS } from "../config/constants/socket.js";
import { NOTIFICATION_TYPES } from "../config/constants/notification.js";
import chatService from "../services/chat.service.js";

const createChatRequest = catchAsync(async (req, res) => {
    if (
        await chatRequestService.checkRequestExists(
            req.user.id,
            req.body.receiver_id
        )
    ) {
        return res
            .status(httpStatus.BAD_REQUEST)
            .send("Chat request already exists!");
    }

    const request = await chatRequestService.createChatRequest({
        sender_id: req.user.id,
        receiver_id: req.body.receiver_id,
        message: req.body.message,
    });

    const notification = await notificationService.createNotification({
        sender_id: request.sender_id,
        recipient_ids: [request.receiver_id],
        type: NOTIFICATION_TYPES.CHAT_REQUEST,
        message: `You have a new chat request from <strong>${request.sender.name}</strong>`,
        link: "/chats?tab=requests",
        type: NOTIFICATION_TYPES.CHAT_REQUEST,
        metadata: {
            message: request.message,
        },
    });
    const io = getIO();

    io.to(request.receiver_id.toString()).emit(
        SOCKET_EVENTS.RECEIVE_REQUEST_CHAT,
        notification
    );

    res.status(httpStatus.CREATED).send({ request });
});

const getChatRequests = catchAsync(async (req, res) => {
    const requests = await chatRequestService.getChatRequests(
        req.user.id,
        req.query
    );
    res.status(httpStatus.OK).send({ requests });
});

const acceptChatRequest = catchAsync(async (req, res) => {
    const request = await chatRequestService.acceptChatRequest(
        req.params.requestId,
        req.user.id
    );

    // Create a new chat
    const chat = await chatService.createChat({
        members: [
            { member: request.sender.id },
            { member: request.receiver.id },
        ],
        is_group_chat: false,
    });

    // Create a notification for the sender
    const notification = await notificationService.createNotification({
        sender_id: request.receiver.id,
        recipient_ids: [request.sender.id],
        type: NOTIFICATION_TYPES.CHAT_REQUEST_ACCEPTED,
        message: `<strong>${request.receiver.name}</strong> accepted your chat request.`,
        link: `/chats/${chat.id}`,
    });

    const io = getIO();

    io.to(request.sender.id).emit(
        SOCKET_EVENTS.RECEIVE_CHAT_REQUEST_ACCEPTED,
        notification
    );

    res.status(httpStatus.OK).send({ request, chat });
});

const rejectChatRequest = catchAsync(async (req, res) => {
    const request = await chatRequestService.rejectChatRequest(
        req.params.requestId,
        req.user.id
    );

    // Create a notification for the sender
    const notification = await notificationService.createNotification({
        sender_id: userId,
        recipient_ids: [request.sender.id],
        type: NOTIFICATION_TYPES.CHAT_REQUEST_REJECTED,
        message: `<strong>${request.receiver.name}</strong> rejected your chat request.`,
    });

    const io = getIO();

    io.to(request.sender.id).emit(
        SOCKET_EVENTS.RECEIVE_CHAT_REQUEST_REJECTED,
        notification
    );

    res.status(httpStatus.OK).send({ request });
});

export default {
    getChatRequests,
    acceptChatRequest,
    rejectChatRequest,
    createChatRequest,
};
