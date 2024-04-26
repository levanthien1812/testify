import moment from "moment";
import config from "../config/config.js";
import { Token } from "../models/token.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import tokenTypes from "../config/tokens.js";
import userService from "./user.service.js";
import httpStatus from "http-status";

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
    throw new ApiError("Token not found");
  }
  return tokenDoc;
};

const generateAuthToken = async (user) => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes)
    const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS)

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays)
    const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH)
    await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH)
    
    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate()
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate()
        }
    }
}

const generateResetPasswordToken = async (email) => {
    const user = userService.getUserByEmail(email)
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not users found with this email')
    }
    const resetTokenExpires = moment().add(config.jwt.resetPasswordExpirationMinutes)
    const resetToken = generateToken(user.id, resetTokenExpires, tokenTypes.RESET_PASSWORD)
    await saveToken(resetToken, user.id, resetTokenExpires, tokenTypes.RESET_PASSWORD)

    return resetToken;
}

const generateVerifyEmailToken = async (user) => {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes)
    const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL)
    await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL)
    
    return verifyEmailToken
}

export default {
    generateToken,
    verifyToken,
    saveToken,
    generateAuthToken,
    generateResetPasswordToken,
    generateVerifyEmailToken
}
