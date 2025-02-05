import Joi from "joi";
import { datetime } from "./custom.validation.js";
import { TEST_LEVEL } from "../config/constants/levels.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";

const createTest = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        datetime: Joi.date().required().custom(datetime),
        max_score: Joi.number().min(0).required(),
        level: Joi.string().valid(...Object.values(TEST_LEVEL)),
        duration: Joi.number().min(0).required(),
        description: Joi.string().allow(null).allow(""),
        parts: Joi.array().length(0),
        num_questions: Joi.number().min(1).required(),
        num_parts: Joi.number().min(1).default(1),
        options: Joi.object()
            .optional()
            .keys({
                allow_close_time: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    close_time: Joi.date().optional(),
                }),
                allow_view_submission_after_test: Joi.object().keys({
                    enable: Joi.boolean().required(),
                }),
                allow_multiple_submissions: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    maximum_submissions: Joi.number().min(1).optional(),
                }),
                allow_save_progress: Joi.object().keys({
                    enable: Joi.boolean().required(),
                }),
                allow_show_taker_answers_after_test: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    delay_time: Joi.number().min(0).optional(),
                }),
                allow_show_maker_answers_after_test: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    visibility_level: Joi.string(),
                    public_answers_option: Joi.string().valid(
                        ...Object.values(PUBLIC_ANSWER_OPTION)
                    ),
                    public_answers_date: Joi.date().optional(),
                }),
                allow_shuffle_questions: Joi.object().keys({
                    enable: Joi.boolean().required(),
                }),
                allow_shuffle_answers: Joi.object().keys({
                    enable: Joi.boolean().required(),
                }),
                allow_review_before_submission: Joi.object().keys({
                    enable: Joi.boolean().required(),
                }),
                disallow_time_limit: Joi.object().keys({
                    enable: Joi.boolean().required(),
                }),
            }),
    }),
};

const getTests = {
    query: Joi.object().keys({
        finish: Joi.string().optional(),
        date_from: Joi.string().optional(),
        date_to: Joi.string().optional(),
        search: Joi.string().optional().allow(""),
        status: Joi.string().optional(),
        sort: Joi.string().optional(),
        page: Joi.number().optional(),
        limit: Joi.number().optional(),
    }),
};

export default {
    createTest,
    getTests,
};
