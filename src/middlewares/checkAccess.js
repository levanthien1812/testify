import httpStatus from "http-status";
import { ROLES } from "../config/constants/roles.js";
import { Test } from "../models/test.model.js";
import makerService from "../services/maker.service.js";
import { ApiError } from "../utils/apiError.js";
import { ERROR_CODE, ERROR_MESSAGE } from "../config/constants/errorCode.js";
import takerService from "../services/taker.service.js";
import passcodeService from "../services/passcode.service.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";

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

    if (req.user.role === ROLES.TAKER) {
        const taker = await takerService.getTakerByUserIdAndMakerId(
            user.id,
            test.maker_id
        );

        if (test.share_option === SHARE_OPTION.PASSCODE) {
            if (!passcode) {
                return next(
                    new ApiError(
                        httpStatus.BAD_REQUEST,
                        ERROR_MESSAGE[ERROR_CODE.PASSCODE_REQUIRED],
                        ERROR_CODE.PASSCODE_REQUIRED
                    )
                );
            }

            if (!test.passcode_id) {
                return next(
                    new ApiError(
                        httpStatus.BAD_REQUEST,
                        ERROR_MESSAGE[ERROR_CODE.PASSCODE_NOT_SUPPORTED],
                        ERROR_CODE.PASSCODE_NOT_SUPPORTED
                    )
                );
            }

            const isCorrectPasscode = await passcodeService.checkPasscode(
                test.passcode_id,
                passcode
            );
            if (!isCorrectPasscode) {
                return next(
                    new ApiError(
                        httpStatus.BAD_REQUEST,
                        ERROR_MESSAGE[ERROR_CODE.INCORRECT_PASSCODE],
                        ERROR_CODE.INCORRECT_PASSCODE
                    )
                );
            }
        }

        if (
            test.share_option === SHARE_OPTION.RESTRICTED &&
            !test.taker_ids.includes(taker.id)
        ) {
            return next(
                new ApiError(
                    httpStatus.FORBIDDEN,
                    ERROR_MESSAGE[ERROR_CODE.TEST_ACCESS_DENIED],
                    ERROR_CODE.TEST_ACCESS_DENIED
                )
            );
        }

        if (
            test.status === TEST_STATUS.PUBLISHABLE ||
            test.status === TEST_STATUS.DRAFT
        ) {
            return next(
                new ApiError(
                    httpStatus.BAD_REQUEST,
                    ERROR_MESSAGE[ERROR_CODE.TEST_NOT_AVAILABLE],
                    ERROR_CODE.TEST_NOT_AVAILABLE
                )
            );
        }

        if (test.status === TEST_STATUS.CLOSED) {
            return next(
                new ApiError(
                    httpStatus.BAD_REQUEST,
                    ERROR_MESSAGE[ERROR_CODE.TEST_CLOSED],
                    ERROR_CODE.TEST_CLOSED
                )
            );
        }
    }

    return next();
};
