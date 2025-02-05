import httpStatus from "http-status";
import passcodeService from "../services/passcode.service.js";
import catchAsync from "../utils/catchAsync.js";
import { generatePasscodeByFormat } from "../utils/passcode.js";
import { PASSCODE_METHOD } from "../config/constants/passCode.js";
import { ApiError } from "../utils/apiError.js";

const generatePasscode = catchAsync(async (req, res, next) => {
    const { passcode: passcodeBody } = req.body;

    // Delete previous passcodes if any
    await passcodeService.deletePasscodeByTestId(passcodeBody.test_id);

    let passcodeString;
    do {
        passcodeString = generatePasscodeByFormat(passcodeBody.format);
    } while (!!!(await passcodeService.findPasscodeByCode(passcodeString)));

    const passcode = await passcodeService.createPasscode({
        code: passcodeString,
        valid_in: null,
        valid_till: null,
        method: PASSCODE_METHOD.AUTO_GENERATED,
        test_id: req.params.testId,
    });

    return res.status(httpStatus.CREATED).send({ passcode });
});

const checkPasscode = catchAsync(async (req, res, next) => {
    const { passcode: code } = req.body;
    const passcode = await passcodeService.findPasscodeByCode(code);

    if (!passcode) {
        throw new ApiError(httpStatus.NOT_FOUND, "Passcode not found!");
    }

    return res.status(httpStatus.OK).send({ passcode });
});

export default {
    generatePasscode,
    checkPasscode,
};
