import express from "express";
import { auth } from "../../middlewares/auth.js";
import { RIGHTS } from "../../config/constants/roles.js";
import { validate } from "../../middlewares/validate.js";
import questionBankValidation from "../../validations/questionBank.validation.js";
import questionBankController from "../../controllers/questionBank.controller.js";

const router = express.Router();

router
    .route("/")
    .post(
        auth(RIGHTS.CREATE_QUESTION_BANK),
        validate(questionBankValidation.createQuestionBank),
        questionBankController.createQuestionBank
    )
    .get(
        auth(RIGHTS.GET_QUESTION_BANKS),
        questionBankController.getQuestionBanks
    );

router
    .route("/:id")
    .patch(
        auth(RIGHTS.UPDATE_QUESTION_BANK),
        questionBankController.updateQuestionBank
    )
    .get(auth(RIGHTS.GET_QUESTION_BANK), questionBankController.getQuestionBank)
    .delete(
        auth(RIGHTS.DELETE_QUESTION_BANK),
        questionBankController.deleteQuestionBank
    );

router
    .route("/:id/questions")
    .post(
        auth(RIGHTS.CREATE_QUESTION_IN_BANK),
        validate(questionBankValidation.createQuestion),
        questionBankController.createQuestionInBank
    );

router
    .route("/:id/questions/import")
    .patch(
        auth(RIGHTS.IMPORT_QUESTIONS_TO_BANK),
        validate(questionBankValidation.importQuestionsToBank),
        questionBankController.importQuestionToBank
    );

router
    .route("/:id/questions/:questionId")
    .patch(
        auth(RIGHTS.UPDATE_QUESTION_IN_BANK),
        validate(questionBankValidation.updateQuestion),
        questionBankController.updateQuestionInBank
    )
    .delete(
        auth(RIGHTS.DELETE_QUESTION_IN_BANK),
        questionBankController.deleteQuestion
    );

export default router;
