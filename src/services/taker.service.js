import { Taker } from "../models/taker.model.js";

const createTaker = async (body) => {
    const taker = await Taker.create(body);
    return taker;
};

const getTakersByMaker = async (makerId) => {
    const takers = await Taker.find({
        maker_id: makerId,
    });

    return takers;
};

const updateTaker = async (takerId, body) => {
    const updatedTaker = await Taker.findByIdAndUpdate(takerId, body, {
        new: true,
    });
    return updatedTaker;
};

const deleteTaker = async (takerId) => {
    const deletedTaker = await Taker.findByIdAndDelete(takerId);
    return deletedTaker;
};

const getTakerByUserIdAndMakerId = async (userId, makerId) => {
    const taker = await Taker.findOne({ user_id: userId, maker_id: makerId })
        .populate("user")
        .populate("group");
    return taker;
};

const getById = async (id) => {
    const taker = await Taker.findById(id).populate("user").populate("group");
    return taker;
};

const getTakersByUserId = async (userId) => {
    const takers = await Taker.find({ user_id: userId })
        .populate("user")
        .populate("group");
    return takers;
};

export default {
    createTaker,
    getTakersByMaker,
    updateTaker,
    deleteTaker,
    getTakerByUserIdAndMakerId,
    getById,
    getTakersByUserId,
};
