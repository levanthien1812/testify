import { PassCode } from "../models/passcode.model.js";

const createPasscode = async (passcodeBody) => {
    return await PassCode.create(passcodeBody);
};

const findPasscodeByCode = async (code) => {
    return await PassCode.findOne({ code });
};

const deletePasscodeByTestId = async (testId) => {
    return await PassCode.deleteMany({ test_id: testId });
};

const findPasscodeByTestId = async (testId) => {
    return await PassCode.findOne({ test_id: testId });
};

export default {
    createPasscode,
    deletePasscodeByTestId,
    findPasscodeByCode,
    findPasscodeByTestId,
};
