import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import userService from "./user.service.js";
import tokenService from "./token.service.js";
import tokenTypes from "../config/tokens.js";
import { OAuth2Client } from "google-auth-library";
import { Token } from "../models/token.model.js";

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

    const { email, name, picture } = payload;
    const user = await userService.getUserByEmail(email);
    if (user) {
        if (user.name && user.photo) {
            return user;
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
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
        type: tokenTypes.REFRESH,
    });
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, "Refresh token not found");
    }

    await Token.findByIdAndDelete(refreshTokenDoc._id);
    return;
};

export default {
    login,
    refreshAuth,
    loginGoogle,
    logout,
};
