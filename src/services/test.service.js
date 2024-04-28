import { Test } from "../models/test.model.js";

const createTest = async (body) => {
  const newTest = await Test.create(body);
  return newTest;
};

export default { createTest };
