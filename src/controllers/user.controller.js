import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import userService from "../services/user.service.js";
import { ROLES } from "../config/constants/roles.js";
import catchAsync from "../utils/catchAsync.js";
import testService from "../services/test.service.js";
import takerService from "../services/taker.service.js";
import makerService from "../services/maker.service.js";
import { unlinkImages } from "../utils/linkImage.js";
import takerGroupService from "../services/takerGroup.service.js";

const getUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    return res.status(httpStatus.ACCEPTED).send({ users });
});

const createTaker = catchAsync(async (req, res, next) => {
    let userTaker = await userService.getUserByEmail(req.body.email);
    if (!userTaker) {
        userTaker = await userService.createUser({
            ...req.body,
            role: ROLES.TAKER,
            photo: req.file?.path,
        });
    }
    const maker = await makerService.getMakerByUserId(req.user.id);
    const taker = await takerService.getTakerByUserIdAndMakerId(
        userTaker.id,
        maker.id
    );

    if (taker) {
        return res.status(httpStatus.BAD_REQUEST).send("Taker already exists!");
    }

    const takerBody = {
        user_id: userTaker.id,
        maker_id: maker.id,
        name: req.body.name,
        group_id: req.body.group_id,
    };

    const newTaker = await takerService.createTaker(takerBody);

    if (takerBody.group_id) {
        await takerGroupService.addTakerToGroup(
            takerBody.group_id,
            newTaker.id
        );
    }

    return res.status(httpStatus.CREATED).send({ taker: newTaker });
});

const updateTaker = catchAsync(async (req, res, next) => {
    let taker = await takerService.getById(req.params.id);
    let userTaker = await userService.getUserById(taker.user_id);
    if (req.file) {
        unlinkImages([userTaker.photo]);
    }
    const updatedUser = await userService.updateUser(userTaker.id, {
        ...req.body,
        photo: req.file?.path,
    });
    const updatedTaker = await takerService.updateTaker(req.params.id, {
        ...req.body,
    });

    if (req.body.group_id) {
        if (taker.group_id) {
            await takerGroupService.removeTakerFromGroup(
                taker.group_id,
                taker.id
            );
        }
        await takerGroupService.addTakerToGroup(req.body.group_id, taker.id);
    }

    return res.status(httpStatus.ACCEPTED).send({
        user: updatedUser,
        taker: updatedTaker,
    });
});

const getTakersByMaker = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const takers = await takerService.getTakersByMaker(maker.id);

    return res.status(httpStatus.ACCEPTED).send({ takers });
});

const getTakersWithStatistics = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const takers = await takerService.getTakersByMaker(maker.id);
    let { sort } = req.query;

    let takersWithStatistics = await Promise.all(
        takers.map(async (taker) => {
            const takerWithStatistics = await testService.getTakerStatistics(
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
});

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

const getTakerUsersByEmailSearch = catchAsync(async (req, res) => {
    const { email } = req.query;
    const users = await userService.getTakerUsersByEmailSearch(email);
    const existingTakers = await takerService.getTakersByMaker(req.user.id);
    const existingTakerUserIds = existingTakers.map((taker) => taker.user_id);

    const filteredUsers = users
        .filter((user) => !existingTakerUserIds.includes(user.id))
        .slice(0, 5);

    return res.status(httpStatus.OK).send({ users: filteredUsers });
});

const updateUser = catchAsync(async (req, res) => {
    const updatedUser = await userService.updateUser(req.params.id, req.body);

    return res.status(httpStatus.OK).send({ user: updatedUser });
});

export default {
    getUsers,
    getTakersByMaker,
    getTakersWithStatistics,
    blockUser,
    unblockUser,
    getBlockedInfo,
    createTaker,
    updateTaker,
    getTakerUsersByEmailSearch,
    updateUser,
};
