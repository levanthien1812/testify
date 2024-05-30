import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

const createUser = async (body) => {
    if (await User.isEmailTaken(body.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }

    const newUser = await User.create(body);
    return newUser;
};

const getTakersByMaker = async (makerId) => {
    const takers = await User.find({ maker_id: makerId });

    return takers;
};

const getUser = async (id) => {
    return User.findById(id);
};

const getUserByEmail = async (email) => {
    return User.findOne({ email });
};

export default { createUser, getUser, getUserByEmail, getTakersByMaker };
