import express from "express";
import { createHistoryRouter } from "./api/historyRoutes";
import { createLookupRouter } from "./api/lookupRoutes";
import type { LookupServiceContract } from "./services/lookupService";

interface ErrorWithCode {
  code?: string;
  errors?: unknown[];
  message?: string;
  stack?: string;
}

interface LoggableError {
  name?: string;
  message?: string;
  stack?: string;
  code?: string;
  errors?: Array<LoggableError | unknown>;
}

function hasErrorCode(value: unknown, codes: string[]) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const error = value as ErrorWithCode;
  return typeof error.code === "string" && codes.includes(error.code);
}

function isDatabaseUnavailableError(error: unknown): boolean {
  const transientCodes = ["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"];
  const postgresCodes = ["42P01", "3D000"];

  if (hasErrorCode(error, transientCodes) || hasErrorCode(error, postgresCodes)) {
    return true;
  }

  if (
    error &&
    typeof error === "object" &&
    Array.isArray((error as ErrorWithCode).errors)
  ) {
    return (error as ErrorWithCode).errors!.some((entry) =>
      hasErrorCode(entry, transientCodes),
    );
  }

  return false;
}

function toLoggableError(error: unknown): LoggableError | unknown {
  if (error instanceof Error) {
    const loggable: LoggableError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (typeof (error as ErrorWithCode).code === "string") {
      loggable.code = (error as ErrorWithCode).code;
    }

    if (Array.isArray((error as ErrorWithCode).errors)) {
      loggable.errors = (error as ErrorWithCode).errors?.map((entry) =>
        toLoggableError(entry),
      );
    }

    return loggable;
  }

  return error;
}

export function createApp(lookupService: LookupServiceContract) {
  const app = express();

  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api/lookups", createLookupRouter(lookupService));
  app.use("/api/history", createHistoryRouter(lookupService));

  app.use((error: Error, request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error("Request failed", {
      method: request.method,
      path: request.path,
      error: toLoggableError(error),
    });

    if (isDatabaseUnavailableError(error)) {
      response.status(503).json({
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "資料庫目前無法使用，請先啟動 PostgreSQL 並執行 migration。",
        },
      });
      return;
    }

    response.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Unexpected server error.",
      },
    });
  });

  return app;
}
