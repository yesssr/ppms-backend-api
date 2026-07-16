import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getTeams,
  getTeamById,
  createTeam as createTeamSvc,
  updateTeam as updateTeamSvc,
  deleteTeam as deleteTeamSvc,
  getTeamMembers,
  addTeamMember as addTeamMemberSvc,
  removeTeamMember as removeTeamMemberSvc,
} from "./service.js";
import type { NewTeam } from "./schema.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  TeamPaginationQuery,
  TeamParams,
  TeamBody,
  TeamUpdateBody,
  AddMemberBody,
} from "./validation.js";

export async function listTeams(context: { query: TeamPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getTeams({ page, limit });
    return successWithMeta(result.data, result.meta, "Teams retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve teams", "FETCH_TEAMS_ERROR");
  }
}

export async function getTeam(context: { params: TeamParams }) {
  try {
    const team = await getTeamById(context.params.id);
    return success(team, "Team retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Team not found", "TEAM_NOT_FOUND");
    }
    return error("Failed to retrieve team", "FETCH_TEAM_ERROR");
  }
}

export async function createTeam(context: { body: TeamBody }) {
  try {
    const team = await createTeamSvc(context.body);
    return success(team, "Team created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Team name already exists", "TEAM_NAME_EXISTS");
    }
    return error("Failed to create team", "CREATE_TEAM_ERROR");
  }
}

export async function updateTeam(context: {
  params: TeamParams;
  body: TeamUpdateBody;
}) {
  try {
    const team = await updateTeamSvc(context.params.id, context.body);
    return success(team, "Team updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Team not found", "TEAM_NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Team name already exists", "TEAM_NAME_EXISTS");
    }
    return error("Failed to update team", "UPDATE_TEAM_ERROR");
  }
}

export async function deleteTeam(context: { params: TeamParams }) {
  try {
    await deleteTeamSvc(context.params.id);
    return success(null, "Team deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Team not found", "TEAM_NOT_FOUND");
    }
    return error("Failed to delete team", "DELETE_TEAM_ERROR");
  }
}

export async function listTeamMembers(context: { params: TeamParams }) {
  try {
    const members = await getTeamMembers(context.params.id);
    return success(members, "Team members retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve team members", "FETCH_TEAM_MEMBERS_ERROR");
  }
}

export async function addTeamMember(context: {
  params: TeamParams;
  body: AddMemberBody;
}) {
  try {
    const member = await addTeamMemberSvc({
      teamId: context.params.id,
      userId: context.body.userId,
    });
    return success(member, "Member added to team successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return error("User is already a member of this team", "TEAM_MEMBER_EXISTS");
    }
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Team or user not found", "NOT_FOUND");
    }
    return error("Failed to add member to team", "ADD_TEAM_MEMBER_ERROR");
  }
}

export async function removeTeamMember(context: {
  params: TeamParams;
  body: AddMemberBody;
}) {
  try {
    await removeTeamMemberSvc(context.params.id, context.body.userId);
    return success(null, "Member removed from team successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Team member not found", "TEAM_MEMBER_NOT_FOUND");
    }
    return error("Failed to remove member from team", "REMOVE_TEAM_MEMBER_ERROR");
  }
}
