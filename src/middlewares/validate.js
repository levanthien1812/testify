import Joi from "joi";
import { pick } from "../utils/pick.js";
import { ApiError } from "../utils/apiError.js";
import httpStatus from "http-status";

export const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["body", "params", "query"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({
      errors: { label: "key" },
      abortEarly: false,
    })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};
