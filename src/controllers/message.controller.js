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

const updateMessage = catchAsync(async (req, res, next) => {
    const message = await messageService.updateMessage(
        req.params.messageId,
        req.body
    );

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

const deleteMessage = catchAsync(async (req, res, next) => {
    await messageService.deleteMessage(req.params.messageId);

    return res.status(httpStatus.OK).send({ deleted: true });
});

export default {
    createMessage,
    updateMessage,
    getMessages,
    updateMessagesReadByByChatId,
    deleteMessage,
};
