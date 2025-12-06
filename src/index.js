import app from "./app.js";
import config from "./config/config.js";
import mongoose from "mongoose";
import { logger } from "./config/logger.js";
import { remindProvideAnswersJob, updateTestsStatusJob } from "./jobs/cron.js";
import initializeSocket from "./config/socket.js";
import { createServer } from "http";

let server = createServer(app);

mongoose.connect(config.mongo.url, config.mongo.options).then(() => {
    logger.info("Connected to MongoDB");
    server.listen(config.port, () => {
        logger.info(`Testify app listening on port ${config.port}`);
    });

    initializeSocket(server);

    updateTestsStatusJob.start();
    remindProvideAnswersJob.start();
});
