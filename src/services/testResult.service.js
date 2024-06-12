import { TestResult } from "../models/testResult.model.js";

const createTestResult = async (testResultBody) => {
    const testResult = await TestResult.create(testResultBody);
    return testResult;
};

export default {
    createTestResult,
};
