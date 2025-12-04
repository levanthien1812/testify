import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import userService from "./user.service.js";
import tokenService from "./token.service.js";
import TOKEN_TYPE from "../config/constants/tokens.js";
import { OAuth2Client } from "google-auth-library";
import { Token } from "../models/token.model.js";
import { generateVerificationCode } from "../utils/generateCode.js";
import { verificationEmailTemplate } from "../templates/verificationEmail.js";
import sendEmail from "../utils/sendEmail.js";

const login = async (body) => {
    const user = await userService.getUserByEmail(body.email);
    if (!user) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "User with this email not found"
        );
    }
    const isPasswordMatch = await user.isPasswordMatch(body.password);
    if (!isPasswordMatch) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Password is not correct");
    }
    return user;
};

const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(
            refreshToken,
            TOKEN_TYPE.REFRESH
        );

        if (!refreshTokenDoc) {
            throw new ApiError(
                httpStatus.UNAUTHORIZED,
                "Refresh token not found"
            );
        }

        const user = await userService.getUser(refreshTokenDoc.user);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found");
        }

        await tokenService.deleteById(refreshTokenDoc._id);
        const tokens = await tokenService.generateAuthToken(user);
        return tokens;
    } catch (error) {
        throw error;
    }
};

const loginGoogle = async (token) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid token");
    }

    const { email, name, picture } = payload;
    const user = await userService.getUserByEmail(email);
    if (user) {
        if (user.name && user.photo) {
            return user;
        }

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            {
                name: name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                photo: picture,
            },
            { new: true }
        );

        return updatedUser;
    } else {
        throw new ApiError(httpStatus.NOT_FOUND, "Taker not found");
    }
};

const logout = async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({
        token: refreshToken,
        type: TOKEN_TYPE.REFRESH,
    });
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, "Refresh token not found");
    }

    await Token.findByIdAndDelete(refreshTokenDoc._id);
    return;
};

const sendVerificationEmail = async (email) => {
    const user = await userService.getUserByEmail(email);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.is_verified) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already verified");
    }

    const verificationCode = generateVerificationCode(6);
    const html = verificationEmailTemplate(
        verificationCode,
        process.env.VERFICATION_EXPIRES_IN_MINUTES
    );

    await sendEmail(email, "Your Testify Verification Code", html);

    await userService.updateUser(user.id, {
        verification_code: verificationCode,
        verification_code_expires: new Date(
            Date.now() + process.env.VERFICATION_EXPIRES_IN_MINUTES * 60 * 1000
        ),
    });
};

const verifyEmail = async (email, code) => {
    const user = await userService.getUserByEmail(email);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (user.is_verified) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already verified");
    }

    if (user.verification_code !== code) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid verification code");
    }
    if (user.verification_code_expires < new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Verification code expired");
    }
    await userService.updateUser(user.id, {
        is_verified: true,
        verification_code: null,
        verification_code_expires: null,
    });
};

export default {
    login,
    refreshAuth,
    loginGoogle,
    logout,
    sendVerificationEmail,
    verifyEmail,
};
