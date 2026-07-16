import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  caseStudyPaginationQuery,
  caseStudyParams,
  caseStudyBody,
  updateCaseStudyBody,
} from "./validation.js";

export const caseStudyRoutes = new Elysia({ name: "case-studies" })
  .get("/", ctrl.listCaseStudies, { query: caseStudyPaginationQuery })
  .get("/:id", ctrl.getCaseStudy, { params: caseStudyParams })
  .post("/", ctrl.createCaseStudy, { body: caseStudyBody })
  .put("/:id", ctrl.updateCaseStudy, {
    params: caseStudyParams,
    body: updateCaseStudyBody,
  })
  .delete("/:id", ctrl.deleteCaseStudy, { params: caseStudyParams });
