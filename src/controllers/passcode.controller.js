import httpStatus from "http-status";
import passcodeService from "../services/passcode.service.js";
import catchAsync from "../utils/catchAsync.js";
import { generatePasscodeByFormat } from "../utils/passcode.js";
import { PASSCODE_METHOD } from "../config/constants/passCode.js";

const generatePasscode = catchAsync(async (req, res, next) => {
    const { passcode: passcodeBody } = req.body;

    const passcodeString = generatePasscodeByFormat(passcodeBody.format);

    // Delete previous passcodes if any
    await passcodeService.deletePasscodeByTestId(passcodeBody.test_id);

    const passcode = await passcodeService.createPasscode({
        code: passcodeString,
        valid_in: null,
        valid_till: null,
        method: PASSCODE_METHOD.AUTO_GENERATED,
        test_id: req.params.testId,
    });

    return res.status(httpStatus.CREATED).send({ passcode });
});

export default {
    generatePasscode,
};
