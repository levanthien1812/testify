import { PassCode } from "../models/passcode.model.js";

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

const checkPasscode = async (id, code) => {
    return await PassCode.findOne({ _id: id, code });
};

export default {
    createPasscode,
    findPasscodeByCode,
    deleteById,
    getById,
    checkPasscode,
};
