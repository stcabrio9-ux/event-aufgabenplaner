import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import eventsRouter from "./routes/events.js";
import resourcesRouter from "./routes/resources.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.frontendUrls.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed."));
  }
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "event-aufgabenplaner-api" }));
app.use("/api/events", eventsRouter);
app.use("/api", resourcesRouter);
app.use(notFound);
app.use(errorHandler);
