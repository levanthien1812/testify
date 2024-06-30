import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import userService from "../services/user.service.js";
import { logger } from "../config/logger.js";

const getUsers = async (req, res, next) => {
    const users = await User.find();
    return res.status(httpStatus.ACCEPTED).send({ users });
};

const createTakers = async (req, res, next) => {
    const takersBody = req.body.takers.map((taker) => {
        return {
            ...taker,
            maker_id: req.user.id,
            role: "taker",
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

export default {
    getUsers,
    createTakers,
    getTakersByMaker,
    getTakersWithStatistics,
};
