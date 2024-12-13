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

const router = express.Router();

/**
 * @openapi
 * /tests:
 *   get:
 *     summary: Get a list of tests
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *           example: 2024-05-01
 *         description: Filter tests from this date (inclusive)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *           example: 2024-05-07
 *         description: Filter tests up to this date (inclusive)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: listening
 *         description: Search tests by title or description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: duration:asc
 *         description: Sort order of tests (e.g., duration:asc or duration:desc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 4
 *         description: The number of tests to return per page
 *     responses:
 *       200:
 *         description: A list of tests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Test'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalResults:
 *                   type: integer
 *                   example: 50
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *   post:
 *     summary: Create a new test
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Listening Test
 *               datetime:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-06-27T04:17:00.000Z
 *               description:
 *                 type: string
 *                 example: Architecto et possimus rerum maiores qui placeat voluptatem.
 *               duration:
 *                 type: integer
 *                 example: 30
 *               max_score:
 *                 type: integer
 *                 example: 10
 *               num_questions:
 *                 type: integer
 *                 example: 5
 *               level:
 *                 type: string
 *                 example: easy
 *               num_parts:
 *                 type: integer
 *                 example: 1
 *               close_time:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-06-29T04:17:00.000Z
 *               code:
 *                 type: string
 *                 example: 39831
 *               public_answers_option:
 *                 type: string
 *                 example: specific date
 *               public_answers_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-06-28T11:17
 *     responses:
 *       201:
 *         description: Test created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Test'
 *       400:
 *         description: Bad request
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
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

/**
 * @openapi
 * /tests/{testId}/parts:
 *   post:
 *     summary: Add a new part to a test
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Parts
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *           example: 667b96ad3f3c65c1006fb1bd
 *         description: The ID of the test the part belongs to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreatePartBody"
 *     responses:
 *       201:
 *         description: Part created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePartResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
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
    .route("/:testId/answers/:answerId")
    .patch(
        auth(RIGHTS.UPDATE_TAKER_ANSWER),
        validate(answerValidation.updateAnswerSchema),
        answerController.updateAnswer
    );

export default router;
