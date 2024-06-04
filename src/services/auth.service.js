import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import userService from "./user.service.js";
import tokenService from "./token.service.js";
import tokenTypes from "../config/tokens.js";
import { OAuth2Client } from "google-auth-library";

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
            tokenTypes.REFRESH
        );

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

    const { email } = payload;
    const user = await userService.getUserByEmail(email);
    if (user) {
        return user;
    } else {
        throw new ApiError(httpStatus.NOT_FOUND, "Taker not found");
    }
};

export default {
    login,
    refreshAuth,
    loginGoogle,
};
