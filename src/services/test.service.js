import httpStatus from "http-status";
import { Test } from "../models/test.model.js";
import { ApiError } from "../utils/apiError.js";
import { logger } from "../config/logger.js";
import { Question } from "../models/question.model.js";
import { SHARE_OPTION } from "../config/constants/shareOptions.js";
import { TEST_STATUS } from "../config/constants/testStatus.js";
import submissionService from "./submission.service.js";
import { Submission } from "../models/submission.model.js";
import { ROLES } from "../config/constants/roles.js";
import { MANUAL_SCORE_TYPE } from "../config/constants/constants.js";
import { Taker } from "../models/taker.model.js";
import takerService from "./taker.service.js";
import makerService from "./maker.service.js";
import questionService from "./question.service.js";
import answerService from "./answer.service.js";
import notificationService from "./notification.service.js";
import { shorten } from "../utils/text.js";
import { NOTIFICATION_TYPES } from "../config/constants/notification.js";
import { PUBLIC_ANSWER_OPTION } from "../config/constants/publicAnswerOptions.js";

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
    let filter;
    if (user.role === ROLES.MAKER) {
        const maker = await makerService.getMakerByUserId(user.id);
        filter = { maker_id: maker.id };
    } else {
        const takers = await takerService.getTakersByUserId(user.id);
        const takerIds = takers.map((taker) => taker.id);
        filter = {
            $or: [
                { taker_ids: { $in: takerIds } },
                { accessed_by: { $in: takerIds } },
            ],
        };
    }

    const query = {};

    if (user.role === ROLES.TAKER) {
        filter.status = {
            $in: [
                TEST_STATUS.PUBLISHED,
                TEST_STATUS.OPENED,
                TEST_STATUS.CLOSED,
            ],
        };
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
                ...filterFieldsByRole(test.toObject(), user.role),
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

const assignTakers = async (testId, takerIds, notifyAssignment = false) => {
    const test = await Test.findById(testId);
    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    let notFoundTakerIds = [];
    takerIds.forEach(async (takerId) => {
        if (!(await takerService.getById(takerId))) {
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

    const updateTest = await Test.findByIdAndUpdate(
        testId,
        {
            $set: {
                taker_ids: takerIds,
                notify_assignment: notifyAssignment,
            },
        },
        { new: true }
    );

    return updateTest;
};

const getAvailableTakers = async (testId, makerId) => {
    const test = await Test.findById(testId);
    const addedTakerIds = test.taker_ids;
    const takers = await Taker.find({
        maker_id: makerId,
        _id: { $nin: addedTakerIds },
    })
        .populate("user", "username name email")
        .populate("group", "-takers");

    return takers;
};

const updateTest = async (testId, body) => {
    const test = await Test.findById(testId);

    if (!test) {
        throw new ApiError(httpStatus.NOT_FOUND, "Test not found");
    }

    if (
        body.share_option &&
        (body.share_option === SHARE_OPTION.ANYONE ||
            body.share_option === SHARE_OPTION.PASSCODE)
    ) {
        body = {
            ...body,
            taker_ids: [],
        };
    }

    const updatedTest = await Test.findByIdAndUpdate(
        testId,
        { $set: body },
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
    // logger.info("Running cron job: updateTestsStatus");
    try {
        const now = new Date();

        // Transition: DRAFT -> PUBLISHABLE
        // Condition: Status is DRAFT and a share_option has been set.
        const toPublishablePromise = Test.updateMany(
            {
                status: TEST_STATUS.DRAFT,
                share_option: { $exists: true, $ne: null },
            },
            { $set: { status: TEST_STATUS.PUBLISHABLE } }
        );

        // Transition: PUBLISHED -> OPENED
        // Condition: Status is PUBLISHED and the start datetime is in the past.
        const toOpenedPromise = Test.updateMany(
            { status: TEST_STATUS.PUBLISHED, datetime: { $lt: now } },
            { $set: { status: TEST_STATUS.OPENED } }
        );

        // Transition: OPENED -> CLOSED
        // Condition: Status is OPENED and the close_time is in the past.
        const toClosedPromise = Test.updateMany(
            {
                status: TEST_STATUS.OPENED,
                "options.allow_close_time.close_time": { $lt: now },
            },
            { $set: { status: TEST_STATUS.CLOSED } }
        );

        const [publishable, opened, closed] = await Promise.all([
            toPublishablePromise,
            toOpenedPromise,
            toClosedPromise,
        ]);

        // logger.info(
        //     `updateTestsStatus finished. Updated: ${
        //         publishable.modifiedCount +
        //         opened.modifiedCount +
        //         closed.modifiedCount
        //     } tests.`
        // );
    } catch (error) {
        logger.error("Error in updateTestsStatus cron job:", error);
    }
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
        includes_manually_scored_questions: includesManuallyScoredQuestions,
    });
};

const addAccessedBy = async (testId, takerId) => {
    const test = await Test.findById(testId);
    if (test.accessed_by.includes(takerId)) return;

    await Test.findByIdAndUpdate(testId, {
        $push: { accessed_by: takerId },
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
    const taker = await takerService.getById(takerId);

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

const getQuestionsResultForTest = async (testId) => {
    const questions = await questionService.getQuestionsByTestId(testId);
    const questionIds = questions.map((q) => q._id);

    const answerStats = await answerService.getAnswerStatsForQuestions(
        questionIds
    );

    // Create a map for quick lookup of stats by question_id
    const statsMap = new Map(
        answerStats.map((stat) => [stat._id.toString(), stat])
    );

    const questionsResult = await Promise.all(
        questions.map(async (question) => {
            const stats = statsMap.get(question._id.toString()) || {
                correct: 0,
                wrong: 0,
                skipped: 0,
            };

            return {
                question: question,
                correct: stats.correct,
                wrong: stats.wrong,
                skipped: stats.skipped,
            };
        })
    );

    return questionsResult;
};

const isTestBelongToUser = async (testId, userId) => {
    const test = await Test.findById(testId);
    const maker = await makerService.getMakerByUserId(userId);

    return test.maker_id === maker.id;
};

const filterFieldsByRole = (test, role) => {
    const tempTest = { ...test };

    if (role === ROLES.TAKER) {
        delete tempTest.taker_ids;
        delete tempTest.joined_taker_ids;
        delete tempTest.accessed_by;
        delete tempTest.takers;
        delete tempTest.passcode_id;
        delete tempTest.share_option;
        delete tempTest.passcode;
        delete tempTest.are_answers_provided;
    }

    return tempTest;
};

const getTestsToImportQuestionToBank = async (userId) => {
    const maker = await makerService.getMakerByUserId(userId);
    let tests = await Test.find({ maker_id: maker.id }).select(
        "id title num_questions"
    );

    tests = await Promise.all(
        tests.map(async (test) => {
            let questions = await questionService.getQuestionsByTestId(
                test.id,
                { includeContent: true }
            );

            if (test.num_parts > 1) {
                questions.sort((a, b) => a.part.order - b.part.order);
            }
            return {
                ...test.toObject(),
                questions,
            };
        })
    );

    tests = tests.filter((test) => test.questions.length > 0);

    return tests;
};

const getTestByPasscode = async (passcodeId) => {
    const test = await Test.findOne({ passcode_id: passcodeId });
    return test;
};

const remindProvideAnswers = async () => {
    logger.info("Running cron job: remindProvideAnswers");
    // Fetch only relevant tests
    const testsToRemind = await Test.find({
        status: { $ne: TEST_STATUS.DRAFT },
        are_answers_provided: false,
    }).populate("maker_id"); // Populate maker to get user_id

    for (const test of testsToRemind) {
        try {
            const areAllQuestionsManualScore =
                await questionService.areAllQuestionsManualScore(test.id);
            if (areAllQuestionsManualScore) continue;

            // This check is already in the query, but good for safety.
            if (test.are_answers_provided) {
                continue;
            }

            const maker = test.maker_id;
            if (!maker || !maker.user_id) continue;

            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const existingNotification =
                await notificationService.getNotification(maker.user_id, {
                    type: NOTIFICATION_TYPES.REMIND_PROVIDE_ANSWERS,
                    "metadata.testId": test.id,
                    created_at: { $gte: startOfToday },
                });

            // Only send 1 notification per day for this test
            if (existingNotification) {
                continue;
            }

            let lastDateToSendNotification = null;
            const publicAnswersOption =
                test.options.allow_show_maker_answers_after_test
                    .public_answers_option;

            switch (publicAnswersOption) {
                case PUBLIC_ANSWER_OPTION.SPECIFIC_DATE:
                    lastDateToSendNotification = new Date(
                        test.options.allow_show_maker_answers_after_test.public_answers_date
                    );
                    break;
                case PUBLIC_ANSWER_OPTION.AFTER_TAKER_SUBMISSION:
                    lastDateToSendNotification = new Date(test.datetime);
                    break;
                case PUBLIC_ANSWER_OPTION.AFTER_CLOSE_TIME:
                    lastDateToSendNotification = new Date(test.close_time);
                    break;
                default:
                    break;
            }

            if (
                !lastDateToSendNotification ||
                lastDateToSendNotification.getTime() > Date.now()
            ) {
                continue;
            }

            // The deadline for providing answers has passed. Send a reminder.
            // The check for an existing notification today already prevents spamming.
            if (lastDateToSendNotification.getTime() <= Date.now()) {
                const notification =
                    await notificationService.createNotification({
                        recipient_ids: [maker.user_id],
                        type: NOTIFICATION_TYPES.REMIND_PROVIDE_ANSWERS,
                        message: `Answers for test "${shorten(
                            test.title,
                            30
                        )}" are not fully provided.`,
                        link: `/tests/${test._id}/edit`,
                        image: `${process.env.SERVER_URL}/images/remind_provide_answers.png`,
                        metadata: {
                            testId: test.id,
                        },
                    });

                await notificationService.sendNotification(notification);
            }
        } catch (error) {
            console.error(
                `Failed to process reminder for test ${test._id}:`,
                error
            );
        }
    }
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
    getQuestionsResultForTest,
    isTestBelongToUser,
    filterFieldsByRole,
    getTestsToImportQuestionToBank,
    getTestByPasscode,
    remindProvideAnswers,
};
