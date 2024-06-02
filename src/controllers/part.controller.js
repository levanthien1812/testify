import httpStatus from "http-status";
import partService from "../services/part.service.js";
import catchAsync from "../utils/catchAsync.js";
import testService from "../services/test.service.js";

const addPart = catchAsync(async (req, res, next) => {
    const test = await testService.findById(req.params.testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test ID not found");
    }

    const newPart = await partService.addPart({
        ...req.body,
        test_id: test.id,
    });

    return res.status(httpStatus.OK).send({ part: newPart });
});

const updatePart = catchAsync(async (req, res, next) => {
    const updatedPart = await partService.updatePart(req.params.partId, req.body);

    return res.status(httpStatus.OK).send({ part: updatedPart });
});

const validateParts = catchAsync(async (req, res, next) => {
    const validated = await partService.validateParts(req.params.testId);

    return res.status(httpStatus.ACCEPTED).send({ validated });
});

export default { addPart, validateParts, updatePart };
