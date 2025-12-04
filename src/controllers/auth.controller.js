import httpStatus from "http-status";
import authService from "../services/auth.service.js";
import tokenService from "../services/token.service.js";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import { auth } from "google-auth-library";
import makerService from "../services/maker.service.js";
import { ROLES } from "../config/constants/roles.js";
import sendEmail from "../utils/sendEmail.js";
import { resetPasswordEmailTemplate } from "../templates/resetPasswordEmail.js";
import TOKEN_TYPE from "../config/constants/tokens.js";
import { ApiError } from "../utils/apiError.js";
import { ERROR_CODE, ERROR_MESSAGE } from "../config/constants/errorCode.js";

const register = catchAsync(async (req, res) => {
    const emailTaken = await userService.checkUserEmailExist(req.body.email);
    if (emailTaken) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }

    const user = await userService.createUser(req.body);
    if (user.role === ROLES.MAKER) {
        await makerService.createMaker({ user_id: user.id, name: user.name });
    }

    await authService.sendVerificationEmail(user.email);

    return res.status(httpStatus.CREATED).json({ user });
});

const login = catchAsync(async (req, res, next) => {
    const user = await authService.login(req.body);
    if (!user.is_verified) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            ERROR_MESSAGE[ERROR_CODE.EMAIL_NOT_VERIFIED],
            ERROR_CODE.EMAIL_NOT_VERIFIED
        );
    }
    const tokens = await tokenService.generateAuthToken(user);

    return res.status(httpStatus.OK).json({ user, tokens });
});

const loginGoogle = catchAsync(async (req, res, next) => {
    const user = await authService.loginGoogle(req.body.token);
    const tokens = await tokenService.generateAuthToken(user);

    return res.status(httpStatus.OK).json({ user, tokens });
});

const refresh = catchAsync(async (req, res, next) => {
    const tokens = await authService.refreshAuth(req.body.token);

    return res.status(httpStatus.OK).send({ tokens });
});

const logout = catchAsync(async (req, res, next) => {
    await authService.logout(req.body.refreshToken);

    return res.status(httpStatus.OK).send();
});

const sendEmailVerification = catchAsync(async (req, res, next) => {
    const emailExist = await userService.checkUserEmailExist(req.body.email);
    if (!emailExist) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "User with this email is not found!"
        );
    }
    await authService.sendVerificationEmail(req.body.email);

    return res.status(httpStatus.OK).send("Email sent successfully!");
});

const verifyEmail = catchAsync(async (req, res, next) => {
    await authService.verifyEmail(req.body.email, req.body.code);

    return res.status(httpStatus.OK).send("Email verified successfully!");
});

const sendResetPasswordEmail = catchAsync(async (req, res, next) => {
    const user = await userService.getUserByEmail(req.body.email);
    if (!user) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "User with this email is not found!"
        );
    }
    const token = await tokenService.generateResetPasswordToken(user.email);
    const resetPasswordUrl = `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reset-password?token=${token}&email=${user.email}`;

    await sendEmail(
        user.email,
        "Reset your password",
        resetPasswordEmailTemplate(
            user.name,
            resetPasswordUrl,
            process.env.RESET_PASSWORD_EXPIRES_IN_MINUTES
        )
    );

    return res.status(httpStatus.OK).send("Email sent successfully!");
});

const resetPassword = catchAsync(async (req, res, next) => {
    const token = await tokenService.verifyToken(
        req.body.token,
        TOKEN_TYPE.RESET_PASSWORD
    );
    if (!token) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Reset token is not found!");
    }
    if (token.expires < new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Reset token is expired!");
    }
    const user = await userService.getUser(token.user);

    await userService.updateUser(user.id, {
        password: req.body.password,
    });

    return res.status(httpStatus.OK).send("Password reset successfully!");
});

export default {
    loginGoogle,
    register,
    login,
    refresh,
    logout,
    sendEmailVerification,
    verifyEmail,
    sendResetPasswordEmail,
    resetPassword,
};
