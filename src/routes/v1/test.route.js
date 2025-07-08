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
import questionValidation from "../../validations/question.validation.js";

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
        validate(partValidation.updatePart),
        partController.updatePart
    );

router
    .route("/:testId/parts/:partId/move")
    .patch(
        auth(RIGHTS.MOVE_PART),
        validate(partValidation.movePart),
        partController.movePart
    );

router
    .route("/:testId/parts/validate")
    .get(auth(RIGHTS.VALIDATE_PARTS), partController.validateParts);

router
    .route("/:testId/questions")
    .post(
        auth(RIGHTS.CREATE_QUESTION),
        validate(questionValidation.createTestQuestion),
        questionController.createQuestion
    );

router
    .route("/:testId/questions/reorder")
    .patch(auth(RIGHTS.REORDER_QUESTIONS), questionController.reorderQuestions);

router
    .route("/:testId/questions/validate")
    .get(auth(RIGHTS.VALIDATE_QUESTIONS), questionController.validateQuestions);

router
    .route("/:testId/questions/:questionId")
    .patch(auth(RIGHTS.UPDATE_QUESTION), questionController.updateQuestion)
    .delete(auth(RIGHTS.DELETE_QUESTION), questionController.deleteQuestion);

router
    .route("/:testId/questions/:questionId/answer")
    .patch(auth(RIGHTS.ADD_ANSWER), questionController.addAnswer);

router
    .route("/:testId/takers")
    .patch(auth(RIGHTS.ASSIGN_TAKERS), testController.assignTakers)
    .post(auth(RIGHTS.CREATE_TAKERS_FOR_TEST), testController.createTakers);

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
    .get(auth(RIGHTS.GET_PASSCODE), passcodeController.getPasscodeByTestId)
    .post(
        auth(RIGHTS.CREATE_PASSCODE),
        validate(passcodeValidation.createPasscode),
        passcodeController.createPasscode
    );

router
    .route("/:testId/passcode/generate")
    .post(
        auth(RIGHTS.GENERATE_PASSCODE),
        validate(passcodeValidation.generatePasscode),
        passcodeController.generatePasscode
    );

router
    .route("/passcode/check")
    .post(
        auth(RIGHTS.CHECK_PASSCODE),
        validate(passcodeValidation.checkPasscode),
        passcodeController.checkPasscode
    );

router
    .route("/:testId/mock-submissions")
    .post(auth(RIGHTS.MOCK_TEST), testController.mockTest);

router
    .route("/:testId/questions-result")
    .get(
        auth(RIGHTS.GET_QUESTIONS_RESULT_FOR_TEST),
        testController.getQuestionsResultForTest
    );

export default router;
