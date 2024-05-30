import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import userService from "../services/user.service.js";

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
    const takes = await userService.getTakersByMaker(req.user.id);

    return res.status(httpStatus.ACCEPTED).send({ takers });
};

export default { getUsers, createTakers, getTakersByMaker };
