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
    );

router
    .route("/questions")
    .post(
        auth(RIGHTS.CREATE_QUESTION_IN_BANK),
        validate(questionBankValidation.createQuestion),
        questionBankController.createQuestionInBank
    );

export default router;
