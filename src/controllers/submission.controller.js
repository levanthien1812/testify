import httpStatus from "http-status";
import testService from "../services/test.service.js";
import { ApiError } from "../utils/apiError.js";
import catchAsync from "../utils/catchAsync.js";
import { testStatus } from "../config/testStatus.js";
import submissionService from "../services/submission.service.js";

const getSubmission = catchAsync(async (req, res, next) => {
    const submission = await submissionService.getSubmissionByTakerId(
        req.user._id,
        req.params.testId
    );

    return res.status(httpStatus.OK).send({ submission });
});

const getSubmissions = catchAsync(async (req, res, next) => {
    const test = await testService.findById(req.params.testId);
    if (!test) {
        return new ApiError(httpStatus.NOT_FOUND, "Test not found!");
    }

    if (![testStatus.OPENED, testStatus.CLOSED].includes(test.status)) {
        return new ApiError(httpStatus.NOT_FOUND, "Test is not opened yet!");
    }

    const submissions = await submissionService.getSubmissionsByTestId(
        req.params.testId
    );

    return res.status(httpStatus.OK).send({ submissions });
});

export default { getSubmission, getSubmissions };
