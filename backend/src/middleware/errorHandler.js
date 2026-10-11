import { AppError } from "../errors.js";

export function notFound(req, _res, next) {
  next(new AppError(`Route nicht gefunden: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({ error: { code, message: statusCode >= 500 ? "Interner Serverfehler." : error.message } });
}
