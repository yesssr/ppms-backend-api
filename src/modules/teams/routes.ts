import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  teamPaginationQuery,
  teamParams,
  teamBody,
  addMemberBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const teamRoutes = new Elysia({ name: "teams", prefix: "/api/teams" })
  .get("/", ctrl.listTeams, {
    query: teamPaginationQuery,
    response: responses.teamList,
    detail: {
      tags: ["Teams"],
      summary: "List teams",
      description: "Returns a paginated list of teams. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getTeam, {
    params: teamParams,
    response: responses.team,
    detail: {
      tags: ["Teams"],
      summary: "Get a team by ID",
      description: "Returns a single team. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createTeam, {
    body: teamBody,
    response: responses.team,
    detail: {
      tags: ["Teams"],
      summary: "Create a team",
      description: "Creates a new team. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateTeam, {
    params: teamParams,
    body: t.Partial(teamBody),
    response: responses.team,
    detail: {
      tags: ["Teams"],
      summary: "Update a team",
      description: "Updates an existing team. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteTeam, {
    params: teamParams,
    response: responses.deleted,
    detail: {
      tags: ["Teams"],
      summary: "Delete a team",
      description: "Deletes a team. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id/members", ctrl.listTeamMembers, {
    params: teamParams,
    response: responses.teamMemberList,
    detail: {
      tags: ["Teams"],
      summary: "List team members",
      description: "Returns the members of a team. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/:id/members", ctrl.addTeamMember, {
    params: teamParams,
    body: addMemberBody,
    response: responses.teamMemberList,
    detail: {
      tags: ["Teams"],
      summary: "Add a team member",
      description: "Adds a user to a team. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id/members", ctrl.removeTeamMember, {
    params: teamParams,
    body: addMemberBody,
    response: responses.teamMemberList,
    detail: {
      tags: ["Teams"],
      summary: "Remove a team member",
      description: "Removes a user from a team. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
