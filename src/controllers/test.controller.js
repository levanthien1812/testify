import httpStatus from "http-status";
import testService from "../services/test.service.js";
import catchAsync from "../utils/catchAsync.js";
import questionService from "../services/question.service.js";

const createTest = catchAsync(async (req, res, next) => {
    const body = { ...req.body, maker_id: req.user.id };
    const test = await testService.createTest(body);
    await questionService.createInitQuestions(test.id, body.num_questions);

    return res.status(httpStatus.CREATED).send({ test });
});

function generateArrayFromQuantity(arr) {
    let result = [];
    arr.forEach((item, index) => {
        for (let i = 0; i < item.num_questions; i++) {
            result.push(index + 1);
        }
    });
    return result;
}

const addParts = catchAsync(async (req, res, next) => {
    const updatedTest = await testService.addParts(req.params.testId, req.body);

    const questionParts = generateArrayFromQuantity(updatedTest.parts);

    await Promise.all(
        questionParts.map(async (partNumber, index) => {
            const result = await questionService.updateQuestionPart(
                req.params.testId,
                index + 1,
                partNumber
            );

            return result;
        })
    );

    return res.status(httpStatus.ACCEPTED).send({ test: updatedTest });
});

const getTests = catchAsync(async (req, res, next) => {
    const filter = { maker_id: req.user.id };
    const query = {};

    req.query.finish &&
        (filter.is_finished = req.query.finish === "true" ? true : false);
    req.query.date_from &&
        (filter.test_date = {
            $gte: new Date(req.query.date_from).toISOString(),
        });
    req.query.date_to &&
        (filter.test_date = {
            ...filter.test_date,
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
    const test = await testService.getTest(req.params.testId);

    return res.status(httpStatus.ACCEPTED).send({ test });
});

const assignTakers = catchAsync(async (req, res, next) => {
    const updatedTest = await testService.assignTakers(
        req.params.testId,
        req.body.taker_ids
    );

    return res.status(httpStatus.ACCEPTED).send({ updatedTest });
});

export default {
    createTest,
    addParts,
    getTests,
    getTest,
    assignTakers,
};
