import { Router } from "express";
import chatController from "../../controllers/chat.controller.js";
import messageController from "../../controllers/message.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import chatValidation from "../../validations/chat.validation.js";

const route = Router();

route
    .route("/")
    .post(
        auth("createChats"),
        validate(chatValidation.createChat),
        chatController.createChat
    )
    .get(auth("getChats"), chatController.getChats);

route
    .route("/:id/messages")
    .post(auth("createMessage"), messageController.createMessage)
    .get(auth("getMessages"), messageController.getMessages);

export default route;
