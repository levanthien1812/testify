import Joi from "joi";
import { PASSCODE_METHOD } from "../config/constants/passCode.js";

const generatePasscode = {
    body: {
        passcode: Joi.object({
            format: Joi.string().required(),
            test_id: Joi.string().required(),
        }),
    },
};

const checkPasscode = {
    body: {
        passcode: Joi.string().required(),
    },
};

export default {
    generatePasscode,
    checkPasscode,
};
