import { CronJob } from "cron";
import testService from "../services/test.service.js";

export const updateTestsStatusJob = new CronJob("*/5 * * * * *", () => {
    testService.updateTestsStatus();
});

// Run once every hour at the beginning of the hour
export const remindProvideAnswersJob = new CronJob("0 * * * *", () => {
    testService.remindProvideAnswers();
});
