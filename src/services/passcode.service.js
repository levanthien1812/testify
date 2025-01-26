import { PassCode } from "../models/passcode.model.js";

const createPasscode = async (passcodeBody) => {
    return await PassCode.create(passcodeBody);
};

export default {
    createPasscode,
};
