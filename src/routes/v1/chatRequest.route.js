import express from "express";
import { RIGHTS } from "../../config/constants/roles.js";
import chatRequestController from "../../controllers/chatRequest.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import chatRequestValidation from "../../validations/chatRequest.validation.js";

const router = express.Router();

router
    .route("/")
    .post(
        auth(RIGHTS.CREATE_CHAT_REQUEST),
        // validate(chatRequestValidation.createChatRequest),
        chatRequestController.createChatRequest
    )
    .get(
        auth(RIGHTS.GET_CHAT_REQUESTS),
        validate(chatRequestValidation.getChatRequests),
        chatRequestController.getChatRequests
    );

router
    .route("/:requestId/accept")
    .patch(
        auth(RIGHTS.ACCEPT_CHAT_REQUEST),
        chatRequestController.acceptChatRequest
    );

router
    .route("/:requestId/reject")
    .patch(
        auth(RIGHTS.REJECT_CHAT_REQUEST),
        chatRequestController.rejectChatRequest
    );

export default router;
