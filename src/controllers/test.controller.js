import httpStatus from "http-status";
import testService from "../services/test.service.js";
import catchAsync from "../utils/catchAsync.js";
import questionService from "../services/question.service.js";
import userService from "../services/user.service.js";
import { testStatus } from "../config/testStatus.js";
import testResultService from "../services/testResult.service.js";

const createTest = catchAsync(async (req, res, next) => {
    const body = {
        ...req.body,
        maker_id: req.user.id,
        status: testStatus.DRAFT,
    };
    const test = await testService.createTest(body);

    return res
        .status(httpStatus.CREATED)
        .send({ test: { ...test.toObject() } });
});

const updateTest = async (req, res, next) => {
    const updatedTest = await testService.updateTest(
        req.params.testId,
        req.body,
        { new: true }
    );

    return res.status(httpStatus.ACCEPTED).send({ test: updatedTest });
};

const getTests = catchAsync(async (req, res, next) => {
    const filter =
        req.user.role === "maker"
            ? { maker_id: req.user.id }
            : { taker_ids: req.user.id };
    const query = {};

    req.query.finish &&
        (filter.is_finished = req.query.finish === "true" ? true : false);
    req.query.date_from &&
        (filter.datetime = {
            $gte: new Date(req.query.date_from).toISOString(),
        });
    req.query.date_to &&
        (filter.datetime = {
            ...filter.datetime,
            $lte: new Date(req.query.date_to).toISOString(),
        });
    req.query.search &&
        (filter.title = { $regex: new RegExp(req.query.search, "i") });

    req.query.sort && (query.sortBy = req.query.sort);
    req.query.page && (query.page = req.query.page);
    req.query.limit && (query.limit = req.query.limit);

    const tests = await testService.getTests(filter, query);

    return res.status(httpStatus.ACCEPTED).send({ tests, filter });
});

const getTest = catchAsync(async (req, res, next) => {
    const test = await testService.getTest(req.params.testId, req.user);

    return res.status(httpStatus.ACCEPTED).send({ test });
});

const assignTakers = catchAsync(async (req, res, next) => {
    const updatedTest = await testService.assignTakers(
        req.params.testId,
        req.body.taker_ids
    );

    return res.status(httpStatus.ACCEPTED).send({ updatedTest });
});

const createTakers = catchAsync(async (req, res, next) => {
    const { testId } = req.params;
    const user = req.user;
    const takersBody = req.body.takersBody.takers;

    const newTakers = await Promise.all(
        takersBody.map(async (takerBody) => {
            const newTaker = await userService.createUser({
                ...takerBody,
                maker_id: user._id,
                role: "taker",
            });

            return newTaker;
        })
    );

    const updatedTest = await testService.assignTakers(
        testId,
        newTakers.map((taker) => taker._id)
    );

    return res.status(httpStatus.ACCEPTED).send({ test: updatedTest });
});

const getAvailableTakers = catchAsync(async (req, res, next) => {
    const takers = await testService.getAvailableTakers(
        req.params.testId,
        req.user._id
    );

    return res.status(httpStatus.OK).send({ takers: takers });
});

const getSubmission = catchAsync(async (req, res, next) => {
    const submission = await testResultService.getTestResultByTakerId(
        req.user._id,
        req.params.testId
    );

    return res.status(httpStatus.OK).send({ submission });
});

export default {
    createTest,
    getTests,
    getTest,
    assignTakers,
    updateTest,
    createTakers,
    getAvailableTakers,
    getSubmission,
};
