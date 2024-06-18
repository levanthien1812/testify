import { Submission } from "../models/submission.model.js";
import { Test } from "../models/test.model.js";

const createSubmission = async (submissionBody) => {
    const submission = await Submission.create(submissionBody);
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

export default {
    createSubmission,
    getSubmissionByTakerId,
    getSubmissionsByTestId,
};
