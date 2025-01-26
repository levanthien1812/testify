import httpStatus from "http-status";
import passcodeService from "../services/passcode.service.js";
import catchAsync from "../utils/catchAsync.js";
import { generatePasscodeByFormat } from "../utils/passcode.js";

const generatePasscode = catchAsync(async (req, res, next) => {
    const { passcode: passcodeBody } = req.body;

    const passcodeString = generatePasscodeByFormat(passcodeBody.format);
    const passcode = await passcodeService.createPasscode({
        code: passcodeString,
        valid_till: new Date().setTime(
            new Date().getTime() + passcodeBody.validIn
        ),
        method: passcodeBody.method,
        test_id: req.params.testId,
    });

    return res.status(httpStatus.CREATED).send({ passcode });
});

export default {
    generatePasscode,
};
