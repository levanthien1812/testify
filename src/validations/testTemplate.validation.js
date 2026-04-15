import Joi from "joi";
import { TEST_LEVEL } from "../config/constants/levels.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import {
    QUESTION_NUMBERING_METHOD,
    PAGINATION_MODE,
    RECORDING_MODE,
} from "../config/constants/test.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";

const createTestTemplate = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        datetime: Joi.string().required(),
        description: Joi.string().allow(null).allow(""),
        duration: Joi.number().min(0).required(),
        max_score: Joi.number().min(0).required(),
        num_questions: Joi.number().min(1).required(),
        num_parts: Joi.number().min(0).required(),
        level: Joi.string()
            .valid(...Object.values(TEST_LEVEL))
            .required(),
        share_option: Joi.string()
            .optional()
            .valid(...Object.values(SHARE_OPTION)),
        question_numbering_method: Joi.string()
            .optional()
            .valid(...Object.values(QUESTION_NUMBERING_METHOD)),
        options: Joi.object()
            .required()
            .keys({
                allow_close_time: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                    close_time: Joi.date().optional(),
                }),
                allow_view_submission_after_test: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                }),
                allow_multiple_submissions: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    maximum_submissions: Joi.number().min(1).optional(),
                    let_taker_know: Joi.boolean().optional(),
                }),
                allow_save_progress: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                }),
                allow_show_taker_answers_after_test: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    delay_time: Joi.number().min(0).optional(),
                    let_taker_know: Joi.boolean().optional(),
                }),
                allow_show_maker_answers_after_test: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    visibility_level: Joi.string(),
                    public_answers_option: Joi.string().valid(
                        ...Object.values(PUBLIC_ANSWER_OPTION),
                    ),
                    public_answers_date: Joi.date().optional(),
                    let_taker_know: Joi.boolean().optional(),
                }),
                allow_shuffle_questions: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                }),
                allow_shuffle_answers: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                }),
                allow_review_before_submission: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                }),
                disallow_time_limit: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                    duration: Joi.number().min(0).optional(),
                }),
                pagination_mode: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                    mode: Joi.string().valid(...Object.values(PAGINATION_MODE)),
                    allow_back_navigation: Joi.boolean().optional(),
                    require_completion_before_next: Joi.boolean().optional(),
                    questions_per_page: Joi.number().optional(),
                }),
                require_screen_recorder: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                    record_mode: Joi.string().valid(
                        ...Object.values(RECORDING_MODE),
                    ),
                    interval_in_seconds: Joi.number().min(0).optional(),
                    include_audio: Joi.boolean().optional(),
                }),
                require_camera_on: Joi.object().keys({
                    enable: Joi.boolean().required(),
                    let_taker_know: Joi.boolean().optional(),
                    record_mode: Joi.string().valid(
                        ...Object.values(RECORDING_MODE),
                    ),
                    interval_in_seconds: Joi.number().min(0).optional(),
                    include_audio: Joi.boolean().optional(),
                }),
            }),
        parts: Joi.array()
            .optional()
            .items(
                Joi.object().keys({
                    name: Joi.string().required(),
                    score: Joi.number().min(0).optional(),
                    description: Joi.string().optional(),
                    num_questions: Joi.number().min(0).required(),
                    order: Joi.number().min(1).required(),
                }),
            ),
    }),
};

const getTestTemplates = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1),
        sort: Joi.string(),
        search: Joi.string(),
    }),
};

const getTestTemplate = {
    params: Joi.object().keys({
        templateId: Joi.string().required(),
    }),
};

const updateTestTemplate = {
    params: Joi.object().keys({
        templateId: Joi.string().required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            datetime: Joi.string(),
            description: Joi.string().allow(null).allow(""),
            duration: Joi.number().min(0),
            max_score: Joi.number().min(0),
            num_questions: Joi.number().min(1),
            num_parts: Joi.number().min(0),
            level: Joi.string().valid(...Object.values(TEST_LEVEL)),
            share_option: Joi.string().valid(...Object.values(SHARE_OPTION)),
            question_numbering_method: Joi.string().valid(
                ...Object.values(QUESTION_NUMBERING_METHOD),
            ),
            options: Joi.object(),
            parts: Joi.array(),
        })
        .min(1),
};

const deleteTestTemplate = {
    params: Joi.object().keys({
        templateId: Joi.string().required(),
    }),
};

export default {
    createTestTemplate,
    getTestTemplates,
    getTestTemplate,
    updateTestTemplate,
    deleteTestTemplate,
};
