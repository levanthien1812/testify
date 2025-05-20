import { Router } from "express";
import chatController from "../../controllers/chat.controller.js";
import messageController from "../../controllers/message.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import chatValidation from "../../validations/chat.validation.js";
import { RIGHTS } from "../../config/constants/roles.js";
import { upload } from "../../config/multer.js";

const route = Router();

route
    .route("/")
    .post(
        auth(RIGHTS.CREATE_CHAT),
        validate(chatValidation.createChat),
        chatController.createChat
    )
    .get(auth(RIGHTS.GET_CHATS), chatController.getChats);

route.route("/:id").patch(auth(RIGHTS.UPDATE_CHAT), chatController.updateChat);
route
    .route("/:id/update-nickname")
    .patch(auth(RIGHTS.UPDATE_NICKNAME), chatController.updateNickname);

route
    .route("/:id/messages")
    .post(
        auth(RIGHTS.CREATE_MESSAGE),
        upload.array("files[]", 10),
        messageController.createMessage
    )
    .get(auth(RIGHTS.GET_MESSAGES), messageController.getMessages);

route
    .route("/:id/messages/update-readby")
    .patch(
        auth(RIGHTS.UPDATE_MESSAGE),
        messageController.updateMessagesReadByByChatId
    );

route
    .route("/:id/messages/:messageId")
    .patch(auth(RIGHTS.UPDATE_MESSAGE), messageController.updateMessage)
    .delete(auth(RIGHTS.DELETE_MESSAGE), messageController.deleteMessage);

route
    .route("/ai")
    .post(
        auth(RIGHTS.CREATE_CHAT_AI),
        validate(chatValidation.createChatAI),
        chatController.createChatAI
    );

route
    .route("/ai/:id/messages")
    .post(
        auth(RIGHTS.CREATE_MESSAGE_AI),
        validate(chatValidation.createMessageAI),
        messageController.createMessageAI
    );

export default route;
