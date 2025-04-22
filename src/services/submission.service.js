import { PUBLIC_ANSWER_VISIBILITY_LEVEL } from "../config/constants/levels.js";
import { ROLES } from "../config/constants/roles.js";
import { Submission } from "../models/submission.model.js";
import { Test } from "../models/test.model.js";
import answerService from "./answer.service.js";

const createSubmission = async (submissionBody) => {
    const submission = await Submission.create(submissionBody);
    return submission;
};

const updateSubmission = async (submissionId, submissionBody) => {
    const submission = await Submission.findByIdAndUpdate(
        submissionId,
        submissionBody,
        { new: true }
    );
    return submission;
};

const getSubmissionsByTakerId = async (takerId, testId, userRole) => {
    const test = await Test.findOne({ _id: testId });

    let fieldsToSelect = [];
    if (
        userRole === ROLES.TAKER &&
        test.options.allow_show_maker_answers_after_test.enable
    ) {
        if (
            new Date(
                test.options.allow_show_maker_answers_after_test.public_answers_date
            ) > new Date()
        ) {
            switch (
                test.options.allow_show_maker_answers_after_test
                    .visibility_level
            ) {
                case PUBLIC_ANSWER_VISIBILITY_LEVEL.SUMMARY:
                    fieldsToSelect = [
                        "score",
                        "-correct_answers",
                        "-wrong_answers",
                        "-remark",
                    ];
                    break;
                case PUBLIC_ANSWER_VISIBILITY_LEVEL.DETAILED:
                    fieldsToSelect = [
                        "score",
                        "correct_answers",
                        "wrong_answers",
                        "remark",
                    ];
                    break;
                default:
                    break;
            }
        }
    }

    const submissions = await Submission.find({
        taker_id: takerId,
        test_id: testId,
    }).select(fieldsToSelect.join(" "));

    return submissions;
};

const getSubmissionsByTestId = async (testId) => {
    const submissions = await Submission.find({ test_id: testId }).populate({
        path: "taker_id",
    });
    return submissions;
};

const scoreSubmission = async (submissionId) => {
    let submission = await Submission.findById(submissionId);
    const test = await Test.findById(submission.test_id);

    const answers = await answerService.getAnswersBySubmissionId(submissionId);

    if (test.are_answers_provided && answers.length > 0) {
        const archivedScore = answers.reduce(
            (acc, answer) => acc + (answer.score || 0),
            0
        );

        const totalCorrectAnswers = answers.filter(
            (answer) => answer.is_correct === true
        ).length;

        const totalWrongAnswers = answers.filter(
            (answer) => answer.is_correct === false
        ).length;

        submission = await updateSubmission(submission.id, {
            wrong_answers: totalWrongAnswers,
            correct_answers: totalCorrectAnswers,
            score: archivedScore,
        });
    }

    return submission;
};

const findById = async (submissionId) => {
    const submission = await Submission.findById(submissionId);
    return submission;
};

export default {
    createSubmission,
    updateSubmission,
    getSubmissionsByTakerId,
    getSubmissionsByTestId,
    scoreSubmission,
    findById,
};
