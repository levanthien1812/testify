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

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    if (user.role === ROLES.MAKER) {
        await makerService.createMaker({ user_id: user.id, name: user.name });
    }

    // await authService.sendVerificationEmail(user.email);

    return res.status(httpStatus.CREATED).json({ user });
});

const login = catchAsync(async (req, res, next) => {
    const user = await authService.login(req.body);
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

const verifyEmail = catchAsync(async (req, res, next) => {
    await authService.verifyEmail(req.body.email, req.body.code);

    return res.status(httpStatus.OK).send("Email verified successfully!");
});

const sendResetPasswordEmail = catchAsync(async (req, res, next) => {
    const user = await userService.getUserByEmail(req.body.email);
    if (!user) {
        throw new Error("User with this email is not found!");
    }
    const token = await tokenService.generateResetPasswordToken(user.email);
    const resetPasswordUrl = `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/reset-password?token=${token}&email=${user.email}`;

    await sendEmail(
        user.email,
        "Reset your password",
        resetPasswordEmailTemplate
            .replace("{{RESET_PASSWORD_URL}}", resetPasswordUrl)
            .replace("{{NAME}}", user.name)
    );

    return res.status(httpStatus.OK).send("Email sent successfully!");
});

const resetPassword = catchAsync(async (req, res, next) => {
    const token = await tokenService.verifyToken(
        req.body.token,
        TOKEN_TYPE.RESET_PASSWORD
    );
    if (!token) {
        throw new Error("Reset token is not found!");
    }
    if (token.expires < new Date()) {
        throw new Error("Reset token is expired!");
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
    verifyEmail,
    sendResetPasswordEmail,
    resetPassword,
};
