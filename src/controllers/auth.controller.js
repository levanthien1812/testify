import tokenService from "../services/token.service.js";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthToken(user);

  return res.status(200).json({ user, tokens });
});

export default {
  register,
};
