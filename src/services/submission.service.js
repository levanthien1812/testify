import { Submission } from "../models/submission.model.js";

const createSubmission = async (submissionBody) => {
    const submission = await Submission.create(submissionBody);
    return submission;
};

const getSubmissionByTakerId = async (takerId, testId) => {
    const submission = await Submission.findOne({
        taker_id: takerId,
        test_id: testId,
    });

    return submission;
};

export default {
    createSubmission,
    getSubmissionByTakerId,
};
