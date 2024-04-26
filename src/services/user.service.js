import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

const createUser = async (body) => {
  const { username, name, email, password } = body;

  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return User.create(body);
};

const getUser = async (id) => {};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

export default { createUser, getUser, getUserByEmail };
