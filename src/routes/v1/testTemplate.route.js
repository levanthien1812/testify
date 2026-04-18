import express from "express";
import { validate } from "../../middlewares/validate.js";
import testTemplateValidation from "../../validations/testTemplate.validation.js";
import testTemplateController from "../../controllers/testTemplate.controller.js";
import { auth } from "../../middlewares/auth.js";
import { RIGHTS } from "../../config/constants/roles.js";
import partController from "../../controllers/part.controller.js";
import partValidation from "../../validations/part.validation.js";

const router = express.Router();

router
    .route("")
    .post(
        auth(RIGHTS.CREATE_TEMPLATE),
        validate(testTemplateValidation.createTestTemplate),
        testTemplateController.createTestTemplate,
    )
    .get(
        auth(RIGHTS.GET_TEMPLATES),
        validate(testTemplateValidation.getTestTemplates),
        testTemplateController.getTestTemplates,
    );

router
    .route("/:templateId")
    .get(
        auth(RIGHTS.GET_TEMPLATE),
        validate(testTemplateValidation.getTestTemplate),
        testTemplateController.getTestTemplate,
    )
    .patch(
        auth(RIGHTS.UPDATE_TEMPLATE),
        validate(testTemplateValidation.updateTestTemplate),
        testTemplateController.updateTestTemplate,
    )
    .delete(
        auth(RIGHTS.UPDATE_TEMPLATE),
        validate(testTemplateValidation.deleteTestTemplate),
        testTemplateController.deleteTestTemplate,
    );

router
    .route("/:templateId/parts")
    .post(
        auth(RIGHTS.ADD_PART),
        validate(partValidation.addPart),
        partController.addPart,
    );

router
    .route("/:templateId/parts/:partId")
    .patch(
        auth(RIGHTS.UPDATE_PART),
        validate(partValidation.updatePart),
        partController.updatePart,
    );

export default router;
