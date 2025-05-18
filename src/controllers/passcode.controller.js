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
    const { passcode: passcodeBody } = req.body;

    // Delete previous passcodes if any
    do {
        await passcodeService.deletePasscodeByTestId(req.params.testId);
    } while (await passcodeService.findPasscodeByCode(passcodeBody.code));

    const passcode = await passcodeService.createPasscode({
        ...passcodeBody,
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
const getPasscodeByTestId = catchAsync(async (req, res, next) => {
    const passcode = await passcodeService.findPasscodeByTestId(
        req.params.testId
    );

    if (!passcode) {
        throw new ApiError(httpStatus.NOT_FOUND, "Passcode not found!");
    }

    return res.status(httpStatus.OK).send({ passcode });
});

export default {
    generatePasscode,
    createPasscode,
    checkPasscode,
    getPasscodeByTestId,
};
