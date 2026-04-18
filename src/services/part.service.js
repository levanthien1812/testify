import httpStatus from "http-status";
import { Part } from "../models/part.model.js";
import { ApiError } from "../utils/apiError.js";
import testService from "./test.service.js";
import testTemplateService from "./testTemplate.service.js";

const addPart = async (partBody) => {
    // Validate score against parent (test or template) if it exists
    if (partBody.test_id) {
        const test = await testService.findById(partBody.test_id);
        if (!test) {
            throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
        }
        if (partBody.score > test.max_score) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Part score must be smaller than test's max score",
            );
        }
    }

    if (partBody.template_id) {
        const template = await testTemplateService.findById(
            partBody.template_id,
        );
        if (!template) {
            throw new ApiError(httpStatus.NOT_FOUND, "Template not found");
        }
        if (partBody.score > template.max_score) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Part score must be smaller than template's max score",
            );
        }
    }

    const newPart = await Part.create(partBody);
    return newPart;
};

const validateParts = async (parentId, parentType = "test") => {
    let parent;
    if (parentType === "test") {
        parent = await testService.findById(parentId);
    } else if (parentType === "template") {
        parent = await testTemplateService.findById(parentId);
    }

    if (!parent) {
        throw new ApiError(httpStatus.NOT_FOUND, `${parentType} not found`);
    }

    if (parent.num_parts === 0) {
        return true;
    }

    const fieldName = parentType === "test" ? "test_id" : "template_id";
    const calculateTotalPartsScores = await Part.aggregate([
        {
            $match: {
                [fieldName]: parent._id,
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

    if (totalScores != parent.max_score) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Total parts scores must be equal to ${parentType}'s max score`,
        );
    }

    return true;
};

const getPartsByTestId = async (testId) => {
    const parts = await Part.find({ test_id: testId });
    parts.sort((a, b) => a.order - b.order);
    return parts;
};

const getPartsByParent = async (parentId, parentType = "test") => {
    const fieldName = parentType === "test" ? "test_id" : "template_id";
    const parts = await Part.find({ [fieldName]: parentId });
    parts.sort((a, b) => a.order - b.order);
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

    if (!part) {
        throw new ApiError(httpStatus.NOT_FOUND, "Part not found");
    }

    // Determine the parent (test or template) this part belongs to
    const parentId = part.test_id || part.template_id;
    const parentType = part.test_id ? "test_id" : "template_id";

    if (!parentId) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Part must belong to either a test or template to be moved",
        );
    }

    // Get parent to check total parts
    let parentNumParts;
    if (parentType === "test_id") {
        const test = await testService.findById(parentId);
        parentNumParts = test.num_parts;
    } else {
        const template = await testTemplateService.findById(parentId);
        parentNumParts = template.num_parts;
    }

    let currentPart, otherPart;

    if (direction === "up") {
        if (part.order === 1) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Part is already at the top of the list",
            );
        }

        const previousPart = await Part.findOne({
            [parentType]: parentId,
            order: part.order - 1,
        });

        if (previousPart) {
            otherPart = await Part.findOneAndUpdate(
                { _id: previousPart._id },
                { $inc: { order: 1 } },
                { new: true },
            );
        }

        currentPart = await Part.findOneAndUpdate(
            { _id: partId },
            { $inc: { order: -1 } },
            { new: true },
        );
    } else if (direction === "down") {
        if (part.order === parentNumParts) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Part is already at the bottom of the list",
            );
        }

        const nextPart = await Part.findOne({
            [parentType]: parentId,
            order: part.order + 1,
        });

        if (nextPart) {
            otherPart = await Part.findOneAndUpdate(
                { _id: nextPart._id },
                { $inc: { order: -1 } },
                { new: true },
            );
        }

        currentPart = await Part.findOneAndUpdate(
            { _id: partId },
            { $inc: { order: 1 } },
            { new: true },
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
    getPartsByParent,
    updatePart,
    movePart,
};
