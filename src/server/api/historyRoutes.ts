import express from "express";
import type { LookupServiceContract } from "../services/lookupService";

export function createHistoryRouter(lookupService: LookupServiceContract) {
  const router = express.Router();

  router.get("/", async (request, response) => {
    const page = Number.parseInt(String(request.query.page ?? "1"), 10);
    const q =
      typeof request.query.q === "string" ? request.query.q : undefined;
    const result = await lookupService.listHistory({ page, q });

    response.json(result);
  });

  return router;
}
