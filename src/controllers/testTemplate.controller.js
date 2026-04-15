import httpStatus from "http-status";
import testTemplateService from "../services/testTemplate.service.js";
import catchAsync from "../utils/catchAsync.js";
import makerService from "../services/maker.service.js";

const createTestTemplate = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);

    const body = {
        ...req.body,
        maker_id: maker.id,
    };

    const template = await testTemplateService.createTestTemplate(body);

    return res.status(httpStatus.CREATED).send({ template });
});

const getTestTemplates = catchAsync(async (req, res, next) => {
    const maker = await makerService.getMakerByUserId(req.user.id);
    const result = await testTemplateService.getTestTemplates(
        maker.id,
        req.query,
    );

    return res.status(httpStatus.OK).send(result);
});

const getTestTemplate = catchAsync(async (req, res, next) => {
    const template = await testTemplateService.getTestTemplate(
        req.params.templateId,
    );

    return res.status(httpStatus.OK).send({ template });
});

const updateTestTemplate = catchAsync(async (req, res, next) => {
    const template = await testTemplateService.updateTestTemplate(
        req.params.templateId,
        req.body,
    );

    return res.status(httpStatus.ACCEPTED).send({ template });
});

const deleteTestTemplate = catchAsync(async (req, res, next) => {
    const template = await testTemplateService.deleteTestTemplate(
        req.params.templateId,
    );

    return res.status(httpStatus.OK).send({ template });
});

export default {
    createTestTemplate,
    getTestTemplates,
    getTestTemplate,
    updateTestTemplate,
    deleteTestTemplate,
};
