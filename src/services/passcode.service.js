import httpStatus from "http-status";
import { PassCode } from "../models/passcode.model.js";
import { ApiError } from "../utils/apiError.js";
import { ERROR_CODE, ERROR_MESSAGE } from "../config/constants/errorCode.js";

const createPasscode = async (passcodeBody) => {
    return await PassCode.create(passcodeBody);
};

const findPasscodeByCode = async (code) => {
    return await PassCode.findOne({ code });
};

const deleteById = async (id) => {
    return await PassCode.findByIdAndDelete(id);
};

const getById = async (id) => {
    return await PassCode.findById(id);
};

const checkPasscode = async (code) => {
    const passcode = await PassCode.findOne({ code });

    if (!passcode) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            ERROR_MESSAGE[ERROR_CODE.PASSCODE_NOT_FOUND],
            ERROR_CODE.PASSCODE_NOT_FOUND
        );
    }

    if (passcode.valid_till < new Date()) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            ERROR_MESSAGE[ERROR_CODE.EXPIRED_PASSCODE],
            ERROR_CODE.EXPIRED_PASSCODE
        );
    }

    return true;
};

const checkCorrectPasscode = async (id, code) => {
    const passcode = await PassCode.findById(id);
    if (passcode.code === code) {
        return true;
    }
    return false;
};

export default {
    createPasscode,
    findPasscodeByCode,
    deleteById,
    getById,
    checkPasscode,
    checkCorrectPasscode,
};
