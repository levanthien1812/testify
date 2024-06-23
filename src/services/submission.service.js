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

const getSubmissionByTakerId = async (takerId, testId) => {
    const test = await Test.findOne({ _id: testId });
    const publicAnswer =
        new Date(test.public_answers_date).getTime() < Date.now();

    const submission = await Submission.findOne({
        taker_id: takerId,
        test_id: testId,
    }).select(
        `${!publicAnswer ? "-score -wrong_answers -correct_answers" : ""}`
    );

    return submission;
};

const getSubmissionsByTestId = async (testId) => {
    const submissions = await Submission.find({ test_id: testId }).populate({
        path: "taker_id",
        select: "-role",
    });
    return submissions;
};

const scoreSubmission = async (submissionId) => {
    let submission = await Submission.findById(submissionId);
    const test = await Test.findById(submission.test_id);

    const answers = await answerService.getAnswersBySubmissionId(submissionId);

    if (test.are_answers_provided && answers.length > 0) {
        const archivedScore = answers.reduce(
            (acc, answer) => acc + answer.score,
            0
        );

        const totalCorrectAnswers = answers.filter(
            (answer) => answer.is_correct
        ).length;

        const totalWrongAnswers = answers.filter(
            (answer) => !answer.is_correct
        ).length;

        submission = await updateSubmission(submission.id, {
            wrong_answers: totalWrongAnswers,
            correct_answers: totalCorrectAnswers,
            score: archivedScore,
        });
    }

    return submission
};

export default {
    createSubmission,
    updateSubmission,
    getSubmissionByTakerId,
    getSubmissionsByTestId,
    scoreSubmission,
};
