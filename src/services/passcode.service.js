import { PassCode } from "../models/passcode.model.js";

const createPasscode = async (passcodeBody) => {
    return await PassCode.create(passcodeBody);
};

const deletePasscodeByTestId = async (testId) => {
    return await PassCode.deleteMany({ test_id: testId });
};

export default {
    createPasscode,
    deletePasscodeByTestId,
};
