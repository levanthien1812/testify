import httpStatus from "http-status";
import { ROLES } from "../config/constants/roles.js";
import { Test } from "../models/test.model.js";
import makerService from "../services/maker.service.js";
import { ApiError } from "../utils/apiError.js";
import { ERROR_CODE, ERROR_MESSAGE } from "../config/constants/errorCode.js";

export const checkAccess = () => async (req, res, next) => {
    const testId = req.params.testId;
    const user = req.user;
    if (!user)
        return next(new ApiError(httpStatus.UNAUTHORIZED, "User not found"));

    const test = await Test.findById(testId);

    if (!test) {
        return next(new ApiError(httpStatus.NOT_FOUND, "Test not found", 404));
    }

    if (user.role === ROLES.MAKER) {
        const maker = await makerService.getMakerByUserId(user.id);
        if (test.maker_id.toString() !== maker.id.toString()) {
            return next(
                new ApiError(
                    httpStatus.FORBIDDEN,
                    ERROR_MESSAGE[ERROR_CODE.TEST_ACCESS_DENIED],
                    ERROR_CODE.TEST_ACCESS_DENIED
                )
            );
        }
    }
    return next();
};
