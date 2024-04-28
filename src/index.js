import app from "./app.js";
import config from "./config/config.js";
import mongoose from "mongoose";
import { logger } from "./config/logger.js";

let server;
mongoose.connect(config.mongo.url, config.mongo.options).then(() => {
  logger.info("Connected to MongoDB");
  server = app.listen(config.port, () => {
    logger.info(`Testify app listening on port ${config.port}`);
  });
});
