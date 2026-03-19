import express from "express";
import { LOOKUP_STATUS_HTTP_MAP } from "../../shared/contracts/lookup";
import type { LookupSubmission } from "../../shared/types/lookup";
import type { LookupServiceContract } from "../services/lookupService";

export function createLookupRouter(lookupService: LookupServiceContract) {
  const router = express.Router();

  router.post("/resolve", async (request, response) => {
    const submission = (request.body ?? {}) as Partial<LookupSubmission>;
    const result = await lookupService.resolve({ url: submission.url ?? "" });
    const statusCode = LOOKUP_STATUS_HTTP_MAP[result.record.status];

    response.status(statusCode).json(result);
  });

  return router;
}
