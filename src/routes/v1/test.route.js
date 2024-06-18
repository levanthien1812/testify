import express from "express";
import { validate } from "../../middlewares/validate.js";
import testValidation from "../../validations/test.validation.js";
import testController from "../../controllers/test.controller.js";
import { auth } from "../../middlewares/auth.js";
import questionController from "../../controllers/question.controller.js";
import answerController from "../../controllers/answer.controller.js";
import partValidation from "../../validations/part.validation.js";
import partController from "../../controllers/part.controller.js";
import submissionController from "../../controllers/submission.controller.js";

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
    .route("/:testId")
    .get(auth("getTest"), testController.getTest)
    .patch(auth("updateTest"), testController.updateTest);

router
    .route("/:testId/parts")
    .post(
        auth("addPart"),
        validate(partValidation.addPart),
        partController.addPart
    );

router
    .route("/:testId/parts/:partId")
    .patch(
        auth("updatePart"),
        validate(partValidation.addPart),
        partController.updatePart
    );

router
    .route("/:testId/parts/validate")
    .get(auth("validateParts"), partController.validateParts);

router
    .route("/:testId/questions")
    .post(auth("createQuestion"), questionController.createQuestion);

router
    .route("/:testId/questions/:questionId")
    .patch(auth("updateQuestion"), questionController.updateQuestion);

router
    .route("/:testId/questions/validate")
    .get(auth("validateQuestions"), questionController.validateQuestions);

router
    .route("/:testId/questions/:questionId/answer")
    .patch(auth("addAnswer"), questionController.addAnswer);

router
    .route("/:testId/takers")
    .patch(auth("assignTakers"), testController.assignTakers)
    .post(auth("createTakersForTest"), testController.createTakers);

router
    .route("/:testId/takers/available")
    .get(auth("getAvailableTakers"), testController.getAvailableTakers);

router
    .route("/:testId/submission")
    .get(auth("getSubmission"), submissionController.getSubmission)
    .post(auth("submitAnswers"), answerController.submitAnswers);

router
    .route("/:testId/submissions")
    .get(auth("getSubmissions"), submissionController.getSubmissions);

export default router;
