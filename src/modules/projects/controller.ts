import { success, error } from "../../utils/response.js";
import { auth } from "../auth/auth.js";
import {
  getProjects,
  getProjectById,
  createProject as createProjectSvc,
  updateProject as updateProjectSvc,
  deleteProject as deleteProjectSvc,
  generateThumbnailKey,
  uploadThumbnail,
  updateProjectProgress as updateProjectProgressSvc,
  getProjectByIdentifier as getProjectByIdentifierSvc,
  getProjectLogs as getProjectLogsSvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  ProjectPaginationQuery,
  ProjectParams,
  ProjectBody,
  UpdateProjectBody,
  UpdateProjectProgressBody,
} from "./validation.js";

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/jfif",
];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function listProjects(context: { query: ProjectPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getProjects({
      page,
      limit,
      search: context.query.search,
      serviceId: context.query.serviceId,
      status: context.query.status,
    });
    return result;
  } catch (err) {
    return error("Failed to retrieve projects", "FETCH_PROJECTS_ERROR");
  }
}

export async function getProject(context: { params: ProjectParams }) {
  try {
    const project = await getProjectById(context.params.id);
    return success(project, "Project retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Project not found", "PROJECT_NOT_FOUND");
    }
    return error("Failed to retrieve project", "FETCH_PROJECT_ERROR");
  }
}

export async function createProject(context: { body: ProjectBody }) {
  try {
    const body = context.body;

    let thumbnail = body.thumbnail;

    if (body.thumbnailFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(body.thumbnailFile.type)) {
        return error(
          "Invalid image type. Only PNG, JPEG, GIF, JFIF, and WebP are allowed",
          "INVALID_IMAGE_TYPE"
        );
      }
      if (body.thumbnailFile.size > MAX_IMAGE_SIZE) {
        return error("Image size must be less than 10MB", "IMAGE_TOO_LARGE");
      }

      const buffer = Buffer.from(await body.thumbnailFile.arrayBuffer());
      const key = generateThumbnailKey(body.thumbnailFile.name);
      thumbnail = await uploadThumbnail(key, buffer, body.thumbnailFile.type);
    }

    const project = await createProjectSvc({
      serviceId: body.serviceId,
      createdBy: body.createdBy,
      name: body.name,
      clientName: body.clientName,
      description: body.description,
      repositoryUrl: body.repositoryUrl,
      demoUrl: body.demoUrl,
      thumbnail,
      status: body.status,
      budget: body.budget,
      startDate: body.startDate,
      endDate: body.endDate,
      technologyIds: body.technologyIds,
      memberIds: body.memberIds,
      teamIds: body.teamIds,
    });

    return success(project, "Project created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Service, user, team, or technology not found", "NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Project code already exists", "PROJECT_CODE_EXISTS");
    }
    return error("Failed to create project", "CREATE_PROJECT_ERROR");
  }
}

export async function updateProject(context: {
  params: ProjectParams;
  body: UpdateProjectBody;
}) {
  try {
    const body = context.body;

    let thumbnail = body.thumbnail;

    if (body.thumbnailFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(body.thumbnailFile.type)) {
        return error(
          "Invalid image type. Only PNG, JPEG, GIF, JFIF, and WebP are allowed",
          "INVALID_IMAGE_TYPE"
        );
      }
      if (body.thumbnailFile.size > MAX_IMAGE_SIZE) {
        return error("Image size must be less than 10MB", "IMAGE_TOO_LARGE");
      }

      const buffer = Buffer.from(await body.thumbnailFile.arrayBuffer());
      const key = generateThumbnailKey(body.thumbnailFile.name);
      thumbnail = await uploadThumbnail(key, buffer, body.thumbnailFile.type);
    }

    const project = await updateProjectSvc(context.params.id, {
      serviceId: body.serviceId,
      name: body.name,
      clientName: body.clientName,
      description: body.description,
      repositoryUrl: body.repositoryUrl,
      demoUrl: body.demoUrl,
      thumbnail,
      status: body.status,
      budget: body.budget,
      startDate: body.startDate,
      endDate: body.endDate,
      technologyIds: body.technologyIds,
      memberIds: body.memberIds,
      teamIds: body.teamIds,
    });
    return success(project, "Project updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Project not found", "PROJECT_NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Project code already exists", "PROJECT_CODE_EXISTS");
    }
    return error("Failed to update project", "UPDATE_PROJECT_ERROR");
  }
}

export async function updateProjectProgress(context: {
  params: ProjectParams;
  body: UpdateProjectProgressBody;
  request: Request;
}) {
  try {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });
    const project = await updateProjectProgressSvc(context.params.id, {
      progressPercentage: context.body.progressPercentage,
      message: context.body.message,
      updatedBy: session?.user.id,
    });
    return success(project, "Project progress updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Project not found", "PROJECT_NOT_FOUND");
    }
    return error(
      "Failed to update project progress",
      "UPDATE_PROJECT_PROGRESS_ERROR"
    );
  }
}

export async function getProjectLogs(context: { params: ProjectParams }) {
  try {
    const logs = await getProjectLogsSvc(context.params.id);
    return success(logs, "Project logs retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Project not found", "PROJECT_NOT_FOUND");
    }
    return error("Failed to retrieve project logs", "FETCH_PROJECT_LOGS_ERROR");
  }
}

// Public, unauthenticated tracking endpoint (resi-style) for clients.
export async function trackProject(context: { params: { code: string } }) {
  try {
    const project = await getProjectByIdentifierSvc(context.params.code);
    const logs = await getProjectLogsSvc(project.id);
    const payload = {
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      progressPercentage: project.progressPercentage,
      lastChange: project.lastChange,
      logs,
    };
    return success(payload, "Project tracking data retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Project not found", "PROJECT_NOT_FOUND");
    }
    return error(
      "Failed to retrieve tracking data",
      "FETCH_TRACK_PROJECT_ERROR"
    );
  }
}

export async function deleteProject(context: { params: ProjectParams }) {
  try {
    await deleteProjectSvc(context.params.id);
    return success(null, "Project deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Project not found", "PROJECT_NOT_FOUND");
    }
    return error("Failed to delete project", "DELETE_PROJECT_ERROR");
  }
}
