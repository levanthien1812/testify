import httpStatus from "http-status";
import chatService from "../services/chat.service.js";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import { CHAT_OPTION } from "../config/constants/constants.js";
import { generateChatName } from "../utils/chatName.js";
import messageService from "../services/message.service.js";
import {
    MESSAGE_TYPE,
    NOTIFICATION_TYPE,
} from "../config/constants/message.js";

const getMemberNames = async (members) => {
    const memberNames = await Promise.all(
        members.map(async (member) => {
            const user = await userService.getUserById(member);
            return user.name;
        })
    );
    return memberNames;
};

const createChat = catchAsync(async (req, res, next) => {
    const option = req.query.option;
    const otherMembers = req.body.members;
    const allowedMembers = await userService.getTakersByMaker(req.user.id);

    if (
        !otherMembers.every((member) =>
            allowedMembers.map((member) => member.id).includes(member)
        )
    ) {
        return next(new Error("Invalid members"));
    }

    let newChats;

    if (option === CHAT_OPTION.INDIVIDUAL) {
        newChats = await Promise.all(
            otherMembers.map(async (member) => {
                const members = [req.user.id, member];

                let chatBody = {
                    members: members.map((member) => ({
                        member: member,
                        nick_name: null,
                    })),
                    is_group_chat: false,
                    group_admin: null,
                    chat_name: "",
                };
                const newChat = await chatService.createChat(chatBody);
                return newChat;
            })
        );
    }

    if (option === CHAT_OPTION.GROUP) {
        const members = [req.user.id, ...otherMembers];
        const memberNames = await getMemberNames(otherMembers);

        const chatBody = {
            members: members.map((member) => ({
                member: member,
                nick_name: null,
            })),
            is_group_chat: true,
            group_admin: req.user.id,
            chat_name: generateChatName(memberNames),
        };

        newChats = await chatService.createChat(chatBody);
    }

    return res.status(httpStatus.CREATED).send(newChats);
});

const getChats = catchAsync(async (req, res, next) => {
    const chats = await chatService.getChats(req.user.id);

    return res.status(httpStatus.OK).send({ chats });
});

const updateChat = catchAsync(async (req, res, next) => {
    const updatedChat = await chatService.updateChat(req.params.id, req.body);

    return res.status(httpStatus.OK).send({ chat: updatedChat });
});

const updateNickname = catchAsync(async (req, res, next) => {
    const updatedChat = await chatService.updateNickname(
        req.params.id,
        req.body
    );

    const updatedMember = await userService.getUserById(req.body.memberId);

    const notiMessage = await messageService.createMessage({
        chat_id: req.params.id,
        sender_id: req.user.id,
        type: MESSAGE_TYPE.NOTIFICATION,
        notification_type: NOTIFICATION_TYPE.NICK_NAME_CHANGED,
        text: `${updatedMember.name} nickname has been changed to ${req.body.nickname}`,
    });

    return res
        .status(httpStatus.OK)
        .send({ chat: updatedChat, message: notiMessage });
});

export default {
    createChat,
    getChats,
    updateChat,
    updateNickname,
};
