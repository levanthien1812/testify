import httpStatus from "http-status";
import { User } from "../models/user.model.js";

const getUsers = async (req, res, next) => {
  const users = await User.find();
  return res.status(httpStatus.ACCEPTED).send({ users });
};

export default { getUsers };
