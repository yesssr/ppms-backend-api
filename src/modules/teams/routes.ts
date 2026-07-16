import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  teamPaginationQuery,
  teamParams,
  teamBody,
  addMemberBody,
} from "./validation.js";

export const teamRoutes = new Elysia({ name: "teams" })
  .get("/", ctrl.listTeams, { query: teamPaginationQuery })
  .get("/:id", ctrl.getTeam, { params: teamParams })
  .post("/", ctrl.createTeam, { body: teamBody })
  .put("/:id", ctrl.updateTeam, {
    params: teamParams,
    body: t.Partial(teamBody),
  })
  .delete("/:id", ctrl.deleteTeam, { params: teamParams })
  .get("/:id/members", ctrl.listTeamMembers, { params: teamParams })
  .post("/:id/members", ctrl.addTeamMember, {
    params: teamParams,
    body: addMemberBody,
  })
  .delete("/:id/members", ctrl.removeTeamMember, {
    params: teamParams,
    body: addMemberBody,
  });
