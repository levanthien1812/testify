import Joi from "joi";
import { PASSCODE_METHOD } from "../config/constants/passCode.js";

const generatePasscode = {
    body: Joi.object({
        valid_till: Joi.date().optional(),
        method: Joi.string()
            .valid(...Object.values(PASSCODE_METHOD))
            .required(),
        format: Joi.string().optional(),
        test_id: Joi.string().required(),
    }),
};

export default {
    generatePasscode,
};
