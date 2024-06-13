import { TestResult } from "../models/testResult.model.js";

const createTestResult = async (testResultBody) => {
    const testResult = await TestResult.create(testResultBody);
    return testResult;
};

const getTestResultByTakerId = async (takerId, testId) => {
    const testResult = await TestResult.findOne({
        taker_id: takerId,
        test_id: testId,
    });

    return testResult;
};

export default {
    createTestResult,
    getTestResultByTakerId
};
