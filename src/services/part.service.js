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

    if (test.num_parts <= 1) {
        return true;
    }

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
};

const movePart = async (partId, { direction }) => {
    const part = await Part.findById(partId);
    const test = await Test.findById(part.test_id);
    let currentPart, otherPart;

    if (direction === "up") {
        if (part.order === 1) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Part is already at the top of the list"
            );
        }

        const previousPart = await Part.findOne({
            test_id: part.test_id,
            order: part.order - 1,
        });

        if (previousPart) {
            otherPart = await Part.findOneAndUpdate(
                { _id: previousPart._id },
                { $inc: { order: 1 } },
                { new: true }
            );
        }

        currentPart = await Part.findOneAndUpdate(
            { _id: partId },
            { $inc: { order: -1 } },
            { new: true }
        );
    } else if (direction === "down") {
        if (part.order === test.num_parts) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Part is already at the bottom of the list"
            );
        }

        const nextPart = await Part.findOne({
            test_id: part.test_id,
            order: part.order + 1,
        });

        if (nextPart) {
            otherPart = await Part.findOneAndUpdate(
                { _id: nextPart._id },
                { $inc: { order: -1 } },
                { new: true }
            );
        }

        currentPart = await Part.findOneAndUpdate(
            { _id: partId },
            { $inc: { order: 1 } },
            { new: true }
        );
    } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid direction");
    }

    return [currentPart, otherPart];
};

export default {
    addPart,
    validateParts,
    getPartsByTestId,
    updatePart,
    movePart,
};
