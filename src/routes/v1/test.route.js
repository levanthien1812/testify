import express from "express";
import { validate } from "../../middlewares/validate.js";
import testValidation from "../../validations/test.validation.js";
import testController from "../../controllers/test.controller.js";
import { auth } from "../../middlewares/auth.js";
import questionController from "../../controllers/question.controller.js";

const router = express.Router();

router
    .route("")
    .post(
        auth("createTest"),
        validate(testValidation.createTest),
        testController.createTest
    )
    .get(
        auth("getTests"),
        validate(testValidation.getTests),
        testController.getTests
    );
router
    .route("/:testId/parts")
    .post(
        auth("addParts"),
        validate(testValidation.addParts),
        testController.addParts
    );

router.route("/:testId").get(auth("getTest"), testController.getTest);

router
    .route("/:testId/questions/:questionId")
    .patch(auth("updateQuestion"), questionController.updateQuestion);

export default router;
