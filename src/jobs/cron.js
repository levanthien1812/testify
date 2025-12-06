import { CronJob } from "cron";
import testService from "../services/test.service.js";

export const updateTestsStatusJob = new CronJob("*/5 * * * * *", () => {
    testService.updateTestsStatus();
});

// Run once every minute for testing
export const remindProvideAnswersJob = new CronJob("* * * * *", () => {
    testService.remindProvideAnswers();
});
