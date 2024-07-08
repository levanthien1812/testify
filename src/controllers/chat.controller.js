import httpStatus from "http-status";
import chatService from "../services/chat.service.js";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import { chatOptions } from "../config/constants.js";
import { generateChatName } from "../utils/chatName.js";

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

    if (option === chatOptions.INDIVIDUAL) {
        newChats = await Promise.all(
            otherMembers.map(async (member) => {
                const members = [req.user.id, member];
                const memberNames = await getMemberNames([member]);

                let chatBody = {
                    members: members.map((member) => ({
                        member: member,
                        nick_name: null,
                    })),
                    is_group_chat: false,
                    group_admin: null,
                    chat_name: generateChatName(memberNames),
                };
                const newChat = await chatService.createChat(chatBody);
                return newChat;
            })
        );
    }

    if (option === chatOptions.GROUP) {
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

export default {
    createChat,
    getChats,
};
