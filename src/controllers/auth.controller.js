import { createUser } from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";

const register = catchAsync(async (req, res) => {
  const result = await createUser(req.body);

  return res.status(200).json({ data: result });
});

export default {
  register,
};
