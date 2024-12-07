import moment from "moment";
import config from "../config/config.js";
import { Token } from "../models/token.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import TOKEN_TYPE from "../config/constants/tokens.js";
import userService from "./user.service.js";
import httpStatus from "http-status";
import { logger } from "../config/logger.js";

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
    const tokenDoc = await Token.create({
        token,
        user: userId,
        expires: expires.toDate(),
        type,
        blacklisted,
    });

    return tokenDoc;
};

const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await Token.findOne({
        token,
        type,
        user: payload.sub,
        blacklisted: false,
    });
    if (!tokenDoc) {
        throw new Error("Token not found");
    }
    return tokenDoc;
};

const generateAuthToken = async (user) => {
    const accessTokenExpires = moment().add(
        config.jwt.accessExpirationMinutes,
        "minutes"
    );
    const accessToken = generateToken(
        user.id,
        accessTokenExpires,
        TOKEN_TYPE.ACCESS
    );

    const refreshTokenExpires = moment().add(
        config.jwt.refreshExpirationDays,
        "days"
    );
    const refreshToken = generateToken(
        user.id,
        refreshTokenExpires,
        TOKEN_TYPE.REFRESH
    );
    await saveToken(
        refreshToken,
        user.id,
        refreshTokenExpires,
        TOKEN_TYPE.REFRESH
    );

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

const generateResetPasswordToken = async (email) => {
    const user = userService.getUserByEmail(email);
    if (!user) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Not users found with this email"
        );
    }
    const resetTokenExpires = moment().add(
        config.jwt.resetPasswordExpirationMinutes,
        "minutes"
    );
    const resetToken = generateToken(
        user.id,
        resetTokenExpires,
        TOKEN_TYPE.RESET_PASSWORD
    );
    await saveToken(
        resetToken,
        user.id,
        resetTokenExpires,
        TOKEN_TYPE.RESET_PASSWORD
    );

    return resetToken;
};

const generateVerifyEmailToken = async (user) => {
    const expires = moment().add(
        config.jwt.verifyEmailExpirationMinutes,
        "minutes"
    );
    const verifyEmailToken = generateToken(
        user.id,
        expires,
        TOKEN_TYPE.VERIFY_EMAIL
    );
    await saveToken(
        verifyEmailToken,
        user.id,
        expires,
        TOKEN_TYPE.VERIFY_EMAIL
    );

    return verifyEmailToken;
};

const deleteById = async (tokenId) => {
    const deleted = await Token.findByIdAndDelete(tokenId);
    return deleted;
};

export default {
    generateToken,
    verifyToken,
    saveToken,
    generateAuthToken,
    generateResetPasswordToken,
    generateVerifyEmailToken,
    deleteById,
};
