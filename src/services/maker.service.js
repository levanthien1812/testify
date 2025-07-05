import { Maker } from "../models/maker.model.js";

const getMakerByUserId = async (userId) => {
    const maker = await Maker.findOne({ user_id: userId });
    return maker;
};

const createMaker = async (body) => {
    const maker = await Maker.create(body);
    return maker;
};

export default { getMakerByUserId, createMaker };
