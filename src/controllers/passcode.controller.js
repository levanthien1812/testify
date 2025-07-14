import httpStatus from "http-status";
import passcodeService from "../services/passcode.service.js";
import catchAsync from "../utils/catchAsync.js";
import { generatePasscodeByFormat } from "../utils/passcode.js";
import { PASSCODE_METHOD } from "../config/constants/passCode.js";
import { ApiError } from "../utils/apiError.js";

const generatePasscode = catchAsync(async (req, res, next) => {
    const { passcode: passcodeBody } = req.body;

    const passcode = generatePasscodeByFormat(passcodeBody.format);

    return res.status(httpStatus.CREATED).send({ passcode });
});

const createPasscode = catchAsync(async (req, res, next) => {
    const { testId } = req.params;
    const { passcode: passcodeBody } = req.body;

    const test = await testService.findById(testId);

    // Delete previous passcodes if any
    if (test.passcode_id) {
        await passcodeService.deleteById(test.passcode_id);
    }

    const passcode = await passcodeService.createPasscode({
        ...passcodeBody,
    });

    if (passcode) {
        await testService.updateTest(testId, { passcode_id: passcode.id });
    }

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
    createPasscode,
    checkPasscode,
};
