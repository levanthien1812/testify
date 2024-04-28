import httpStatus from "http-status";
import testService from "../services/test.service.js";
import catchAsync from "../utils/catchAsync.js";

const createTest = catchAsync(async (req, res, next) => {
  const body = { ...req.body, maker_id: req.user.id };
  const test = await testService.createTest(body);

  return res.status(httpStatus.CREATED).send({ test });
});

export default {
  createTest,
};
