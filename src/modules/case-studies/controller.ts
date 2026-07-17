import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getCaseStudies,
  getCaseStudyById,
  createCaseStudy as createCaseStudySvc,
  updateCaseStudy as updateCaseStudySvc,
  deleteCaseStudy as deleteCaseStudySvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import { storageService } from "../../utils/storage.js";
import type {
  CaseStudyPaginationQuery,
  CaseStudyParams,
  CaseStudyBody,
  UpdateCaseStudyBody,
} from "./validation.js";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/jfif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function listCaseStudies(context: { query: CaseStudyPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getCaseStudies({
      page,
      limit,
      status: context.query.status,
    });
    return successWithMeta(result.data, result.meta, "Case studies retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve case studies", "FETCH_CASE_STUDIES_ERROR");
  }
}

export async function getCaseStudy(context: { params: CaseStudyParams }) {
  try {
    const caseStudy = await getCaseStudyById(context.params.id);
    return success(caseStudy, "Case study retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Case study not found", "CASE_STUDY_NOT_FOUND");
    }
    return error("Failed to retrieve case study", "FETCH_CASE_STUDY_ERROR");
  }
}

export async function createCaseStudy(context: { body: CaseStudyBody }) {
  try {
    const body = context.body;

    let coverImage = body.coverImage;

    if (body.coverImageFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(body.coverImageFile.type)) {
        return error("Invalid image type. Only PNG, JPEG, GIF, JFIF, and WebP are allowed", "INVALID_IMAGE_TYPE");
      }
      if (body.coverImageFile.size > MAX_IMAGE_SIZE) {
        return error("Image size must be less than 10MB", "IMAGE_TOO_LARGE");
      }

      const buffer = Buffer.from(await body.coverImageFile.arrayBuffer());
      const key = storageService.generateKey("case-studies/covers", body.coverImageFile.name);
      coverImage = await storageService.upload(key, buffer, body.coverImageFile.type);
    }

    const caseStudy = await createCaseStudySvc({
      projectId: body.projectId,
      title: body.title,
      slug: body.slug,
      challenge: body.challenge,
      solution: body.solution,
      outcome: body.outcome,
      coverImage,
      status: body.status,
      tags: body.tags,
      publishedAt: body.publishedAt,
    });

    return success(caseStudy, "Case study created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Case study slug already exists", "CASE_STUDY_SLUG_EXISTS");
    }
    return error("Failed to create case study", "CREATE_CASE_STUDY_ERROR");
  }
}

export async function updateCaseStudy(context: {
  params: CaseStudyParams;
  body: UpdateCaseStudyBody;
}) {
  try {
    const body = context.body;

    let coverImage = body.coverImage;

    if (body.coverImageFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(body.coverImageFile.type)) {
        return error("Invalid image type. Only PNG, JPEG, GIF, JFIF, and WebP are allowed", "INVALID_IMAGE_TYPE");
      }
      if (body.coverImageFile.size > MAX_IMAGE_SIZE) {
        return error("Image size must be less than 10MB", "IMAGE_TOO_LARGE");
      }

      const buffer = Buffer.from(await body.coverImageFile.arrayBuffer());
      const key = storageService.generateKey("case-studies/covers", body.coverImageFile.name);
      coverImage = await storageService.upload(key, buffer, body.coverImageFile.type);
    }

    const caseStudy = await updateCaseStudySvc(context.params.id, {
      title: body.title,
      slug: body.slug,
      challenge: body.challenge,
      solution: body.solution,
      outcome: body.outcome,
      coverImage,
      status: body.status,
      tags: body.tags,
      publishedAt: body.publishedAt,
    });
    return success(caseStudy, "Case study updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Case study not found", "CASE_STUDY_NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Case study slug already exists", "CASE_STUDY_SLUG_EXISTS");
    }
    return error("Failed to update case study", "UPDATE_CASE_STUDY_ERROR");
  }
}

export async function deleteCaseStudy(context: { params: CaseStudyParams }) {
  try {
    await deleteCaseStudySvc(context.params.id);
    return success(null, "Case study deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Case study not found", "CASE_STUDY_NOT_FOUND");
    }
    return error("Failed to delete case study", "DELETE_CASE_STUDY_ERROR");
  }
}
