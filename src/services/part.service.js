import httpStatus from "http-status";
import { Part } from "../models/part.model.js";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import testService from "./test.service.js";

const addPart = async (partBody) => {
    const test = await testService.findById(partBody.test_id);

    if (partBody.score >= test.max_score) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Part score must be smaller than test's max score"
        );
    }

    const newPart = await Part.create(partBody);
    return newPart;
};

const validateParts = async (testId) => {
    const test = await testService.findById(testId);

    const calculateTotalPartsScores = await Part.aggregate([
        {
            $match: {
                test_id: test._id,
            },
        },
        {
            $group: {
                _id: null,
                score: { $sum: "$score" },
            },
        },
    ]);

    const totalScores =
        calculateTotalPartsScores.length > 0
            ? calculateTotalPartsScores[0].score
            : 0;

    if (totalScores != test.max_score) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Total parts scores must be equal to test's max score"
        );
    }

    return true;
};

const getPartsByTestId = async (testId) => {
    const parts = await Part.find({ test_id: testId });
    return parts;
};

const updatePart = async (partId, partBody) => {
    const part = await Part.findById(partId);

    if (!part) {
        throw new ApiError(httpStatus.NOT_FOUND, "Part not found");
    }

    const updatedPart = await Part.findByIdAndUpdate(partId, partBody, {
        new: true,
    });

    return updatedPart;
}

export default { addPart, validateParts, getPartsByTestId, updatePart };
