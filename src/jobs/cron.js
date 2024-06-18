import { CronJob } from "cron";
import testService from "../services/test.service.js";

export const job = new CronJob("*/5 * * * * *", () => {
    testService.updateTestsStatus();
});
