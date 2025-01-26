import express from "express";
import { validate } from "../../middlewares/validate.js";
import testValidation from "../../validations/test.validation.js";
import testController from "../../controllers/test.controller.js";
import { auth } from "../../middlewares/auth.js";
import questionController from "../../controllers/question.controller.js";
import partValidation from "../../validations/part.validation.js";
import partController from "../../controllers/part.controller.js";
import submissionController from "../../controllers/submission.controller.js";
import answerValidation from "../../validations/answer.validation.js";
import answerController from "../../controllers/answer.controller.js";
import { uploadSingle } from "../../middlewares/upload.js";
import { upload } from "../../config/multer.js";
import { RIGHTS } from "../../config/constants/roles.js";
import userValidation from "../../validations/user.validation.js";
import passcodeController from "../../controllers/passcode.controller.js";
import passcodeValidation from "../../validations/passcode.validation.js";

const router = express.Router();

router
    .route("")
    .post(
        auth(RIGHTS.CREATE_TEST),
        validate(testValidation.createTest),
        testController.createTest
    )
    .get(
        auth(RIGHTS.GET_TESTS),
        validate(testValidation.getTests),
        testController.getTests
    );

router
    .route("/:testId")
    .get(auth(RIGHTS.GET_TEST), testController.getTest)
    .patch(auth(RIGHTS.UPDATE_TEST), testController.updateTest);

router
    .route("/:testId/publish")
    .patch(auth(RIGHTS.PUBLISH_TEST), testController.publishTest);

router
    .route("/:testId/parts")
    .post(
        auth(RIGHTS.ADD_PART),
        validate(partValidation.addPart),
        partController.addPart
    );

router
    .route("/:testId/parts/:partId")
    .patch(
        auth(RIGHTS.UPDATE_PART),
        validate(partValidation.addPart),
        partController.updatePart
    );

router
    .route("/:testId/parts/validate")
    .get(auth(RIGHTS.VALIDATE_PARTS), partController.validateParts);

router
    .route("/:testId/questions")
    .post(
        auth(RIGHTS.CREATE_QUESTION),
        upload.array("files[]", 10),
        questionController.createQuestion
    );

router
    .route("/:testId/questions/:questionId")
    .patch(
        auth(RIGHTS.UPDATE_QUESTION),
        upload.array("files[]", 10),
        questionController.updateQuestion
    );

router
    .route("/:testId/questions/validate")
    .get(auth(RIGHTS.VALIDATE_QUESTIONS), questionController.validateQuestions);

router
    .route("/:testId/questions/:questionId/answer")
    .patch(auth(RIGHTS.ADD_ANSWER), questionController.addAnswer);

router
    .route("/:testId/takers")
    .patch(auth(RIGHTS.ASSIGN_TAKERS), testController.assignTakers)
    .post(auth(RIGHTS.CREATE_TAKER), testController.createTakers);

router
    .route("/:testId/takers/details")
    .post(
        auth(RIGHTS.GET_TAKERS_DETAILS),
        validate(userValidation.getTakersDetails),
        testController.getTakersDetails
    );

router
    .route("/:testId/takers/available")
    .get(auth(RIGHTS.GET_AVAILABLE_TAKERS), testController.getAvailableTakers);

router
    .route("/:testId/submission")
    .get(auth(RIGHTS.GET_SUBMISSION), submissionController.getSubmission)
    .post(
        auth(RIGHTS.CREATE_SUBMISSION),
        submissionController.createSubmission
    );

router
    .route("/:testId/submissions")
    .get(auth(RIGHTS.GET_SUBMISSIONS), submissionController.getSubmissions);

router
    .route("/:testId/submissions/:takerId")
    .get(auth(RIGHTS.GET_TEST), testController.getTest);

router
    .route("/:testId/submissions/:submissionId/answers")
    .get(auth(RIGHTS.GET_ANSWERS), answerController.getAnswers);

router
    .route("/:testId/answers/:answerId")
    .patch(
        auth(RIGHTS.UPDATE_TAKER_ANSWER),
        validate(answerValidation.updateAnswerSchema),
        answerController.updateAnswer
    );

router
    .route("/:testId/passcode")
    .post(
        auth(RIGHTS.GENERATE_PASSCODE),
        validate(passcodeValidation.generatePasscode),
        passcodeController.generatePasscode
    );

export default router;
