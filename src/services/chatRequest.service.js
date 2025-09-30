import httpStatus from "http-status";
import { ApiError } from "../utils/apiError.js";
import { ChatRequest } from "../models/chatRequest.model.js";
import {
    CHAT_REQUEST_STATUS,
    CHAT_REQUEST_TYPE,
} from "../config/constants/chat.js";

const createChatRequest = async (body) => {
    let request = await ChatRequest.create(body);
    request = await request.populate([
        { path: "sender", select: "name email photo" },
        { path: "receiver", select: "name email photo" },
    ]);
    return request;
};

const checkRequestExists = async (senderId, receiverId) => {
    const existingRequest = await ChatRequest.findOne({
        $or: [
            { sender_id: senderId, receiver_id: receiverId },
            { sender_id: receiverId, receiver_id: senderId },
        ],
    });

    return existingRequest;
};

const getChatRequests = async (userId, query) => {
    const filter = {};
    if (query.type === CHAT_REQUEST_TYPE.OUTGOING) {
        filter.sender_id = userId;
    } else {
        filter.receiver_id = userId;
    }

    if (query.status) {
        filter.status = query.status;
    }

    const populatePath =
        query.type === CHAT_REQUEST_TYPE.OUTGOING ? "receiver" : "sender";

    const requests = await ChatRequest.find(filter)
        .populate(populatePath, "name email photo")
        .sort({ created_at: -1 });

    return requests;
};

const updateChatRequest = async (requestId, userId, status) => {
    const request = await ChatRequest.findById(requestId);
    if (!request) {
        throw new ApiError(httpStatus.NOT_FOUND, "Chat request not found");
    }

    if (request.receiver_id.toString() !== userId) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "You are not authorized to perform this action"
        );
    }

    if (request.status !== "pending") {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Chat request is already ${request.status}`
        );
    }

    request.status = status;
    await request.save();
    await request.populate("sender receiver", "name email photo");

    return request;
};

const acceptChatRequest = async (requestId, userId) => {
    const request = await updateChatRequest(requestId, userId, "accepted");

    return request;
};

const rejectChatRequest = async (requestId, userId) => {
    const request = await updateChatRequest(requestId, userId, "rejected");

    return request;
};

export default {
    checkRequestExists,
    createChatRequest,
    getChatRequests,
    acceptChatRequest,
    rejectChatRequest,
};
