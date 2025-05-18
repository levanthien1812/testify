import Joi from "joi";
import {
    PASSCODE_METHOD,
    PASSCODE_VALID_UNIT,
} from "../config/constants/passCode.js";

const generatePasscode = {
    body: {
        passcode: Joi.object({
            format: Joi.string().required(),
        }),
    },
};

const createPasscode = {
    body: {
        passcode: Joi.object({
            format: Joi.string().required(),
            method: Joi.string()
                .required()
                .valid(...Object.values(PASSCODE_METHOD)),
            code: Joi.string().required(),
            valid_in: Joi.number().required(),
            valid_till: Joi.date().required(),
            valid_unit: Joi.string()
                .required()
                .valid(...Object.values(PASSCODE_VALID_UNIT)),
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
    createPasscode,
    checkPasscode,
};
