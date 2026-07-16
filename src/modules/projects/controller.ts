import { success, error } from "../../utils/response.js";
import {
  getProjects,
  getProjectById,
  createProject as createProjectSvc,
  updateProject as updateProjectSvc,
  deleteProject as deleteProjectSvc,
  addProjectTechnology,
  removeProjectTechnology,
  addProjectMember,
  removeProjectMember,
  generateThumbnailKey,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  ProjectPaginationQuery,
  ProjectParams,
  ProjectBody,
  UpdateProjectBody,
} from "./validation.js";

export async function listProjects(context: { query: ProjectPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getProjects({ page, limit });
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
    const project = await updateProjectSvc(context.params.id, {
      serviceId: body.serviceId,
      name: body.name,
      clientName: body.clientName,
      description: body.description,
      repositoryUrl: body.repositoryUrl,
      demoUrl: body.demoUrl,
      thumbnail: body.thumbnail,
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
