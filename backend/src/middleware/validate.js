import { AppError } from "../errors.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new AppError("Ungültige Eingabedaten.", 400, "VALIDATION_ERROR"));
    }
    req[source] = result.data;
    next();
  };
}
