import httpStatus from "http-status";
import messageService from "../services/message.service.js";
import catchAsync from "../utils/catchAsync.js";

const createMessage = catchAsync(async (req, res, next) => {
    const messageBody = {
        ...req.body,
        sender_id: req.user.id,
    };

    const message = await messageService.createMessage(messageBody);

    return res.status(httpStatus.CREATED).send({ message });
});

const getMessages = catchAsync(async (req, res, next) => {
    const messages = await messageService.getMessages(req.params.id);

    return res.status(httpStatus.OK).send({ messages });
});

const updateMessagesReadByByChatId = catchAsync(async (req, res, next) => {
    const messages = await messageService.updateMessagesReadByByChatId(
        req.params.id,
        req.body?.readBy
    );

    return res.status(httpStatus.OK).send({ messages });
});

export default { createMessage, getMessages, updateMessagesReadByByChatId };
