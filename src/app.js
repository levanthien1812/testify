import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "dotenv";
import routes from "./routes/v1/index.js";
import passport from "passport";
import { jwtStrategy } from "./config/passport.js";
import { errorConverter, errorHandler } from "./middlewares/error.js";
import { ApiError } from "./utils/apiError.js";
import httpStatus from "http-status";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(express.static("public"));

app.use(helmet());

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.options("*", cors());

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/v1", routes);

app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorConverter);

app.use(errorHandler);

export default app;
