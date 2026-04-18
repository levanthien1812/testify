import httpStatus from "http-status";
import TestTemplate from "../models/testTemplate.model.js";
import { ApiError } from "../utils/apiError.js";
import { Test } from "../models/test.model.js";

const createTestTemplate = async (templateBody) => {
    const newTemplate = await TestTemplate.create(templateBody);
    return newTemplate;
};

const getTestTemplates = async (makerId, reqQuery) => {
    const filter = { maker_id: makerId };

    if (reqQuery.search) {
        filter.name = { $regex: new RegExp(reqQuery.search, "i") };
    }

    const query = {};
    if (reqQuery.sort) {
        query.sortBy = reqQuery.sort;
    }
    if (reqQuery.page) {
        query.page = reqQuery.page;
    }
    if (reqQuery.limit) {
        query.limit = reqQuery.limit;
    }

    const { results: templates, ...rest } = await TestTemplate.paginate(
        filter,
        query,
    );

    return {
        templates,
        ...rest,
    };
};

const getTestTemplate = async (templateId) => {
    const template = await TestTemplate.findById(templateId);

    if (!template) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test template not found");
    }

    return template;
};

const updateTestTemplate = async (templateId, updateBody) => {
    const template = await getTestTemplate(templateId);

    Object.assign(template, updateBody);
    await template.save();

    return template;
};

const deleteTestTemplate = async (templateId) => {
    const template = await getTestTemplate(templateId);
    await TestTemplate.findByIdAndDelete(templateId);
    return template;
};

const findById = async (templateId) => {
    return await TestTemplate.findById(templateId);
};

export default {
    createTestTemplate,
    getTestTemplates,
    getTestTemplate,
    updateTestTemplate,
    deleteTestTemplate,
    findById,
};
