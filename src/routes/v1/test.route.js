import express from "express"
import { validate } from "../../middlewares/validate.js"
import testValidation from "../../validations/test.validation.js"
import testController from "../../controllers/test.controller.js"
import { auth } from "../../middlewares/auth.js"

const router = express.Router()

router.route('').post(auth('createTest'), validate(testValidation.createTest), testController.createTest)

export default router