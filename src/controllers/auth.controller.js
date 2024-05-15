import httpStatus from "http-status";
import authService from "../services/auth.service.js";
import tokenService from "../services/token.service.js";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthToken(user);

    return res.status(httpStatus.OK).json({ user, tokens });
});

const login = catchAsync(async (req, res, next) => {
    const user = await authService.login(req.body);
    const tokens = await tokenService.generateAuthToken(user);

    return res.status(httpStatus.OK).json({ user, tokens });
});

const refresh = catchAsync(async (req, res, next) => {
    const tokens = await authService.refreshAuth(req.body.token);

    return res.status(httpStatus.OK).send({ tokens });
});

export default {
    register,
    login,
    refresh,
};
