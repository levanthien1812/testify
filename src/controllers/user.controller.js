import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import userService from "../services/user.service.js";

const getUsers = async (req, res, next) => {
    const users = await User.find();
    return res.status(httpStatus.ACCEPTED).send({ users });
};

const createTaker = async (req, res, next) => {
    const takerBody = {
        ...req.body,
        maker_id: req.user.id,
        role: "taker",
    };

    const newTaker = await userService.createUser(takerBody);
    return res.status(httpStatus.CREATED).send({ taker: newTaker });
};

const getTakersByMaker = async (req, res, next) => {
    const takes = await userService.getTakersByMaker(req.user.id);

    return res.status(httpStatus.ACCEPTED).send({ takers });
};

export default { getUsers, createTaker, getTakersByMaker };
