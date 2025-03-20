import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import userService from "../services/user.service.js";
import { logger } from "../config/logger.js";
import { ROLES } from "../config/constants/roles.js";
import catchAsync from "../utils/catchAsync.js";

const getUsers = async (req, res, next) => {
    const users = await User.find();
    return res.status(httpStatus.ACCEPTED).send({ users });
};

const createTakers = async (req, res, next) => {
    const takersBody = req.body.takers.map((taker) => {
        return {
            ...taker,
            maker_id: req.user.id,
            role: ROLES.TAKER,
        };
    });

    const newTakers = await Promise.all(
        takersBody.map(async (takerBody) => {
            return await userService.createUser(takerBody);
        })
    );

    return res.status(httpStatus.CREATED).send({ takers: newTakers });
};

const getTakersByMaker = async (req, res, next) => {
    const takers = await userService.getTakersByMaker(req.user.id);

    return res.status(httpStatus.ACCEPTED).send({ takers });
};

const getTakersWithStatistics = async (req, res, next) => {
    const takers = await userService.getTakersByMaker(req.user.id);
    let { sort } = req.query;

    let takersWithStatistics = await Promise.all(
        takers.map(async (taker) => {
            const takerWithStatistics = await userService.getTakerStatistics(
                taker.id
            );
            return takerWithStatistics;
        })
    );

    // sort takers by average score
    if (!sort) sort = "average_score:desc";
    const [field, order] = sort.split(":");

    takersWithStatistics = takersWithStatistics.sort(
        (a, b) => (b[field] - a[field]) * (order === "asc" ? 1 : -1)
    );

    return res
        .status(httpStatus.ACCEPTED)
        .send({ takers: takersWithStatistics });
};

const blockUser = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const blockedUserId = req.params.blockedUserId;

    const blockedUser = await userService.getUserById(blockedUserId);
    if (!blockedUser) {
        return res
            .status(httpStatus.NOT_FOUND)
            .send("User to block not found!");
    }

    const { updatedUser, updatedBlockedUser } = await userService.blockUser(
        userId,
        blockedUserId
    );

    return res
        .status(httpStatus.CREATED)
        .send({ user: updatedUser, blockedUser: updatedBlockedUser });
});

const unblockUser = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const blockedUserId = req.params.blockedUserId;

    const blockedUser = await userService.getUserById(blockedUserId);
    if (!blockedUser) {
        return res
            .status(httpStatus.NOT_FOUND)
            .send("User to block not found!");
    }

    const { updatedUser, updatedBlockedUser } = await userService.unblockUser(
        userId,
        blockedUserId
    );

    return res
        .status(httpStatus.CREATED)
        .send({ user: updatedUser, unblockedUser: updatedBlockedUser });
});

const getBlockedInfo = catchAsync(async (req, res) => {
    const blockedUsers = await userService.getBlockedUsers(req.user.id);
    const blockedBy = await userService.getBlockedBy(req.user.id);

    return res.status(httpStatus.OK).send({ blockedUsers, blockedBy });
});

export default {
    getUsers,
    createTakers,
    getTakersByMaker,
    getTakersWithStatistics,
    blockUser,
    unblockUser,
    getBlockedInfo,
};
