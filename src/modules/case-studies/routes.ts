import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  caseStudyPaginationQuery,
  caseStudyParams,
  caseStudyBody,
  updateCaseStudyBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const caseStudyRoutes = new Elysia({ name: "case-studies", prefix: "/api/case-studies" })
  .get("/", ctrl.listCaseStudies, {
    query: caseStudyPaginationQuery,
    response: responses.caseStudyList,
    detail: {
      tags: ["Case Studies"],
      summary: "List case studies",
      description: "Returns a paginated list of case studies. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getCaseStudy, {
    params: caseStudyParams,
    response: responses.caseStudy,
    detail: {
      tags: ["Case Studies"],
      summary: "Get a case study by ID",
      description: "Returns a single case study. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createCaseStudy, {
    body: caseStudyBody,
    response: responses.caseStudy,
    detail: {
      tags: ["Case Studies"],
      summary: "Create a case study",
      description: "Creates a new case study. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateCaseStudy, {
    params: caseStudyParams,
    body: updateCaseStudyBody,
    response: responses.caseStudy,
    detail: {
      tags: ["Case Studies"],
      summary: "Update a case study",
      description: "Updates an existing case study. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteCaseStudy, {
    params: caseStudyParams,
    response: responses.deleted,
    detail: {
      tags: ["Case Studies"],
      summary: "Delete a case study",
      description: "Deletes a case study. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
