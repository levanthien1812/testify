import { Maker } from "../models/maker.model.js";
import takerService from "./taker.service.js";

const getMakerByUserId = async (userId) => {
    const maker = await Maker.findOne({ user_id: userId });
    return maker;
};

const createMaker = async (body) => {
    const maker = await Maker.create(body);
    return maker;
};

const getMakersByTakerUserId = async (userId) => {
    const takers = await takerService.getTakersByUserId(userId);
    const makerIds = takers.map((taker) => taker.maker_id);
    const makers = await Maker.find({ _id: { $in: makerIds } });
    return makers;
};

const getById = async (id) => {
    const maker = await Maker.findById(id);
    return maker;
};

export default {
    getMakerByUserId,
    createMaker,
    getMakersByTakerUserId,
    getById,
};
