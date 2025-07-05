import { User } from "../models/user.model.js";

const createUser = async (body) => {
    const newUser = await User.create(body);
    return newUser;
};

const blockUser = async (userId, blockedUserId) => {
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { blocked_users: blockedUserId } },
        { new: true }
    );

    const updatedBlockedUser = await User.findByIdAndUpdate(
        blockedUserId,
        { $addToSet: { blocked_by: userId } },
        { new: true }
    );

    return { updatedUser, updatedBlockedUser };
};

const unblockUser = async (userId, blockedUserId) => {
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { blocked_users: blockedUserId } },
        { new: true }
    );

    const updatedBlockedUser = await User.findByIdAndUpdate(
        blockedUserId,
        { $pull: { blocked_by: userId } },
        { new: true }
    );

    return { updatedUser, updatedBlockedUser };
};

const getBlockedUsers = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return [];

    const blockedUsers = await Promise.all(
        user.blocked_users.map(async (blockedUserId) => {
            const blockedUser = await User.findById(blockedUserId).select(
                "-password -blocked_users"
            );
            return blockedUser;
        })
    );

    return blockedUsers;
};

const getBlockedBy = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return [];

    const blockedBy = await Promise.all(
        user.blocked_by.map(async (blockedUserId) => {
            const blockedUser = await User.findById(blockedUserId).select(
                "-password -blocked_users"
            );
            return blockedUser;
        })
    );

    return blockedBy;
};

const getUser = async (id) => {
    return User.findById(id);
};

const getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const getUserById = async (id) => {
    return await User.findById(id);
};

const updateUser = async (id, body) => {
    return await User.findByIdAndUpdate(id, body, { new: true });
};

const checkUserEmailExist = async (email) => {
    const user = await User.findOne({ email });
    return !!user;
};

export default {
    createUser,
    getUser,
    getUserByEmail,
    getUserById,
    blockUser,
    unblockUser,
    getBlockedUsers,
    getBlockedBy,
    updateUser,
    checkUserEmailExist,
};
