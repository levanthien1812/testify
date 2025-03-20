import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { Test } from "../models/test.model.js";
import { Submission } from "../models/submission.model.js";
import { ROLES } from "../config/constants/roles.js";

const createUser = async (body) => {
    const existingUser = await User.findOne({
        email: body.email,
        maker_id: body.maker_id || null,
    });

    if (existingUser) {
        if (existingUser.role === ROLES.MAKER) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User already exists");
        }

        if (
            existingUser.maker_ids &&
            existingUser.maker_ids.includes(body.maker_id)
        ) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Taker already exists");
        }

        existingUser.maker_ids.push(body.maker_id);
        await existingUser.save();
        return existingUser;
    }

    const newUser = await User.create(body);
    return newUser;
};

const getTakersByMaker = async (makerId) => {
    const takers = await User.find({
        maker_ids: makerId,
        role: ROLES.TAKER,
    });

    return takers;
};

const getTakerStatistics = async (takerId) => {
    const taker = await User.findById(takerId);

    const submissions = await Submission.find({
        taker_id: takerId,
    });

    const totalTestsAssigned = await Test.countDocuments({
        taker_ids: takerId,
    });

    const totalSubmissions = submissions.length;
    const avarageScore =
        submissions.length > 0
            ? submissions.reduce((acc, sub) => {
                  return acc + sub.score;
              }, 0) / submissions.length
            : 0;

    return {
        taker,
        total_tests_assigned: totalTestsAssigned,
        total_submissions: totalSubmissions,
        average_score: avarageScore.toFixed(2),
    };
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

export default {
    createUser,
    getUser,
    getUserByEmail,
    getUserById,
    getTakersByMaker,
    getTakerStatistics,
    blockUser,
    unblockUser,
    getBlockedUsers,
    getBlockedBy,
};
