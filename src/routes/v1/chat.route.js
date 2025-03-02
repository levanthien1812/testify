import { Router } from "express";
import chatController from "../../controllers/chat.controller.js";
import messageController from "../../controllers/message.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import chatValidation from "../../validations/chat.validation.js";
import { RIGHTS } from "../../config/constants/roles.js";

const route = Router();

route
    .route("/")
    .post(
        auth(RIGHTS.CREATE_CHAT),
        validate(chatValidation.createChat),
        chatController.createChat
    )
    .get(auth(RIGHTS.GET_CHATS), chatController.getChats);

route
    .route("/:id/messages")
    .post(auth(RIGHTS.CREATE_MESSAGE), messageController.createMessage)
    .patch(
        auth(RIGHTS.UPDATE_MESSAGE),
        messageController.updateMessagesReadByByChatId
    )
    .get(auth(RIGHTS.GET_MESSAGES), messageController.getMessages);

route
    .route("/:id/messages/:messageId")
    .patch(auth(RIGHTS.UPDATE_MESSAGE), messageController.updateMessage)
    .delete(auth(RIGHTS.DELETE_MESSAGE), messageController.deleteMessage);

export default route;
