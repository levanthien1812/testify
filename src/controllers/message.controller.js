import httpStatus from "http-status";
import messageService from "../services/message.service.js";
import catchAsync from "../utils/catchAsync.js";
import chatService from "../services/chat.service.js";
import { getIO } from "../config/socket.js";

const createMessage = catchAsync(async (req, res, next) => {
    const messageBody = {
        ...req.body,
        sender_id: req.user.id,
        images: req.files ? req.files.map((f) => f.path) : [],
    };

    const message = await messageService.createMessage(messageBody);

    const IO = getIO();

    return res.status(httpStatus.CREATED).send({ message });
});

const updateMessage = catchAsync(async (req, res, next) => {
    const message = await messageService.updateMessage(
        req.params.messageId,
        req.body,
    );

    return res.status(httpStatus.CREATED).send({ message });
});

const getMessages = catchAsync(async (req, res, next) => {
    const messages = await messageService.getMessages(req.params.id, req.query);

    return res.status(httpStatus.OK).send({ messages });
});

const updateMessagesReadByByChatId = catchAsync(async (req, res, next) => {
    const messages = await messageService.updateMessagesReadByByChatId(
        req.params.id,
        req.user.id,
    );

    return res.status(httpStatus.OK).send({ messages });
});

const deleteMessage = catchAsync(async (req, res, next) => {
    const message = await messageService.getMessageById(req.params.messageId);

    if (message.sender_id.toString() !== req.user.id) {
        const updatedMessage = await messageService.pushRemoveFor(
            message.id,
            req.user.id,
        );
        return res.status(httpStatus.OK).send({ message: updatedMessage });
    }

    await messageService.deleteMessage(req.params.messageId);

    return res.status(httpStatus.OK).send({ deleted: true });
});

const createMessageAI = catchAsync(async (req, res, next) => {
    const { model, content } = req.body;

    const messages = await messageService.createMessageAI(
        req.params.id,
        model,
        content,
    );

    await chatService.updateAIChat(req.params.id, { updated_at: new Date() });

    return res.status(httpStatus.CREATED).send({ messages });
});

const createMessageAIStream = async (req, res, next) => {
    const { model, content } = req.body;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const userMessage = await messageService.saveMessageAI({
            chat_id: req.params.id,
            content: content.text,
            role: "user",
        });

        const prevMessages = await messageService.getMessagesAIByChatId(
            req.params.id,
        );

        let stream;
        if (process.env.MOCK_AI === "true") {
            stream = messageService.generateMockMessageAIStream();
        } else {
            stream = await messageService.generateMessageAIStream(model, [
                ...prevMessages,
                { role: "user", content: content.text },
            ]);
        }

        let fullContent = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0].delta.content;
            if (content) {
                fullContent += content;
                // SSE format requires "data: " prefix and double newlines
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        await messageService.saveMessageAI({
            chat_id: req.params.id,
            content: fullContent,
            role: "assistant",
            reply_to: userMessage.id,
        });

        await chatService.updateAIChat(req.params.id, {
            updated_at: new Date(),
        });

        res.write("data: [DONE]\n\n");
        res.end();
    } catch (error) {
        console.error("Error in createMessageAIStream:", error);
        res.write(`data: [ERROR] ${error.message}\n\n`);
        res.end();
    }
};

const getMessagesAI = catchAsync(async (req, res, next) => {
    const messages = await messageService.getMessagesAIByChatId(req.params.id);

    return res.status(httpStatus.OK).send({ messages });
});

const createMockMessageAI = catchAsync(async (req, res, next) => {
    const { content, delay } = req.body;

    const messages = await messageService.createMockMessageAI(
        req.params.id,
        content,
        delay,
    );

    return res.status(httpStatus.CREATED).send({ messages });
});

const updateMessageAI = catchAsync(async (req, res, next) => {
    const { model, content } = req.body;
    const messages = await messageService.updateMessageAI(
        req.params.id,
        model,
        req.params.messageId,
        content,
    );

    return res.status(httpStatus.CREATED).send({ messages });
});

const regenerateMessageAI = catchAsync(async (req, res, next) => {
    const messages = await messageService.regenerateMessageAI(
        req.params.id,
        req.body.model,
        req.params.messageId,
    );

    await chatService.updateAIChat(req.params.id, { updated_at: new Date() });

    return res.status(httpStatus.CREATED).send({ messages });
});

export default {
    createMessage,
    updateMessage,
    getMessages,
    updateMessagesReadByByChatId,
    deleteMessage,
    createMessageAI,
    getMessagesAI,
    createMockMessageAI,
    updateMessageAI,
    regenerateMessageAI,
    createMessageAIStream,
};
