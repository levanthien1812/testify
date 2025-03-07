import httpStatus from "http-status";
import messageService from "../services/message.service.js";
import catchAsync from "../utils/catchAsync.js";

const createMessage = catchAsync(async (req, res, next) => {
    const messageBody = {
        ...req.body,
        sender_id: req.user.id,
        images: req.files ? req.files.map((f) => f.path) : [],
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
    // console.log({ query: req.query });
    const messages = await messageService.getMessages(req.params.id, req.query);

    return res.status(httpStatus.OK).send({ messages });
});

const updateMessagesReadByByChatId = catchAsync(async (req, res, next) => {
    const messages = await messageService.updateMessagesReadByByChatId(
        req.params.id,
        req.user.id
    );

    return res.status(httpStatus.OK).send({ messages });
});

const deleteMessage = catchAsync(async (req, res, next) => {
    const message = await messageService.getMessageById(req.params.messageId);

    if (message.sender_id.toString() !== req.user.id) {
        const updatedMessage = await messageService.pushRemoveFor(
            message.id,
            req.user.id
        );
        return res.status(httpStatus.OK).send({ message: updatedMessage });
    }

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
