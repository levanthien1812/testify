import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import { Question } from "../models/question.model.js";
import { User } from "../models/user.model.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import submissionService from "./submission.service.js";
import { Submission } from "../models/submission.model.js";
import { ROLES } from "../config/constants/roles.js";
import { MANUAL_SCORE_TYPE } from "../config/constants/constants.js";
import userService from "./user.service.js";

const createTest = async (testBody) => {
    const { datetime, enable_close_time, close_time } = testBody;

    if (new Date(datetime).getTime() < Date.now()) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Start time must be in the future"
        );
    }

    if (
        enable_close_time &&
        close_time &&
        new Date(datetime).getTime() > new Date(close_time).getTime()
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Close time must be after start time"
        );
    }

    const newTest = await Test.create(testBody);
    return newTest;
};

const getTests = async (user, reqQuery) => {
    const filter =
        user.role === ROLES.MAKER
            ? { maker_id: user.id }
            : { $or: [{ taker_ids: user.id }, { accessed_by: user.id }] };
    const query = {};

    if (user.role === ROLES.TAKER) {
        filter.status = { $in: [TEST_STATUS.OPENED, TEST_STATUS.CLOSED] };
    }

    reqQuery.date_from &&
        (filter.datetime = {
            $gte: new Date(reqQuery.date_from).toISOString(),
        });
    reqQuery.date_to &&
        (filter.datetime = {
            ...filter.datetime,
            $lte: new Date(reqQuery.date_to).toISOString(),
        });
    reqQuery.search &&
        (filter.title = { $regex: new RegExp(reqQuery.search, "i") });
    reqQuery.status && (filter.status = reqQuery.status);

    reqQuery.sort && (query.sortBy = reqQuery.sort);
    reqQuery.page && (query.page = reqQuery.page);
    reqQuery.limit && (query.limit = reqQuery.limit);

    const { results: tests, ...rest } = await Test.paginate(filter, query);

    const testsWithAddittionalData = await Promise.all(
        tests.map(async (test) => {
            const submissionsCount = await Submission.countDocuments({
                test_id: test._id,
            });

            return {
                ...test.toObject(),
                submissions_count: submissionsCount,
            };
        })
    );

    return { tests: testsWithAddittionalData, ...rest };
};

const getTest = async (testId, user, takerId = null) => {
    const test = await Test.findById(testId);

    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "No test found with this ID");
    }

    return test;
};

const assignTakers = async (testId, takerIds) => {
    const test = await Test.findById(testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    let notFoundTakerIds = [];
    takerIds.forEach(async (takerId) => {
        if (!(await User.find({ _id: takerId, role: ROLES.TAKER }))) {
            notFoundTakerIds.push(takerId);
        }
    });

    takerIds = takerIds.filter((takerId) => {
        return !test.taker_ids.includes(takerId);
    });

    if (notFoundTakerIds.length > 0)
        return new ApiError(
            httpStatus.NOT_FOUND,
            `Takers with id ${notFoundTakerIds.join(", ")} not found`
        );

    if (takerIds.length === 0) return test;

    const updateTest = await Test.findByIdAndUpdate(
        testId,
        {
            $set: {
                taker_ids: [...test.taker_ids, ...takerIds],
            },
        },
        { new: true }
    );

    return updateTest;
};

const getAvailableTakers = async (testId, userId) => {
    const test = await Test.findById(testId);
    const addedTakerIds = test.taker_ids;
    const takers = await User.find({
        maker_ids: userId,
        role: ROLES.TAKER,
        _id: { $nin: addedTakerIds },
    });

    return takers;
};

const updateTest = async (testId, testBody) => {
    const test = await Test.findById(testId);

    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    if (
        testBody.share_option &&
        testBody.share_option === SHARE_OPTION.ANYONE
    ) {
        testBody = {
            ...testBody,
            taker_ids: [],
        };
    }

    const updatedTest = await Test.findByIdAndUpdate(
        testId,
        { $set: testBody },
        {
            new: true,
        }
    );

    return updatedTest;
};

const publishTest = async (testId) => {
    const test = await Test.findById(testId);

    const updatedTest = await Test.findByIdAndUpdate(
        testId,
        { $set: { status: TEST_STATUS.PUBLISHED } },
        {
            new: true,
        }
    );

    return updatedTest;
};

const updateTestsStatus = async () => {
    const now = new Date();

    const tests = await Test.find({});

    tests.forEach(async (test) => {
        let status;
        if (test.status === TEST_STATUS.DRAFT && test.share_option) {
            status = TEST_STATUS.PUBLISHABLE;
        }

        if (
            test.status === TEST_STATUS.PUBLISHED &&
            new Date(test.datetime).getTime() - now.getTime() < 0
        ) {
            status = TEST_STATUS.OPENED;
        }

        if (
            test.status === TEST_STATUS.OPENED &&
            new Date(test.close_time).getTime() - now.getTime() < 0
        ) {
            status = TEST_STATUS.CLOSED;
        }

        await Test.findByIdAndUpdate(test.id, { $set: { status: status } });
    });
};

const findById = async (testId) => {
    const test = await Test.findById(testId);
    return test;
};

const updateIncludingManuallyQuestions = async (testId) => {
    const questions = await Question.find({ test_id: testId });

    const includesManuallyScoredQuestions = questions.some((question) =>
        MANUAL_SCORE_TYPE.includes(question.type)
    );

    await Test.findByIdAndUpdate(testId, {
        inincludes_manually_scored_questions: includesManuallyScoredQuestions,
    });
};

const addAccessedBy = async (testId, userId) => {
    const test = await Test.findById(testId);
    if (test.accessed_by.includes(userId)) return;

    await Test.findByIdAndUpdate(testId, {
        $push: { accessed_by: userId },
    });
};

function calculateAverageScoreOnScale10FromDocuments(tests) {
    let totalNormalizedScore = 0;
    let validTestsCount = 0;

    for (const test of tests) {
        if (typeof test.maxScore === "number" && test.maxScore > 0) {
            const normalizedScore = (test.score / test.maxScore) * 10;
            totalNormalizedScore += normalizedScore;
            validTestsCount++;
        }
    }

    if (validTestsCount > 0) {
        const averageScore = totalNormalizedScore / validTestsCount;
        return averageScore;
    } else {
        return 0;
    }
}

const getTakerStatistics = async (takerId) => {
    const taker = await userService.getUserById(takerId);

    const submissions = await submissionService.findByTakerId(takerId);

    const totalTestsAssigned = await Test.countDocuments({
        taker_ids: takerId,
    });

    const scoresArray = await Promise.all(
        submissions.map(async (submission) => {
            const test = await Test.findById(submission.test_id);
            if (
                !test ||
                submission.score === null ||
                submission.score === undefined
            )
                return {
                    score: 0,
                    maxScore: 0,
                };
            return {
                score: submission.score,
                maxScore: test.max_score,
            };
        })
    );

    const totalSubmissions = submissions.length;
    const avarageScore =
        calculateAverageScoreOnScale10FromDocuments(scoresArray);

    return {
        taker,
        total_tests_assigned: totalTestsAssigned,
        total_submissions: totalSubmissions,
        average_score: avarageScore.toFixed(2),
    };
};

export default {
    createTest,
    getTests,
    getTest,
    assignTakers,
    updateTest,
    publishTest,
    findById,
    getAvailableTakers,
    updateTestsStatus,
    updateIncludingManuallyQuestions,
    addAccessedBy,
    getTakerStatistics,
};
