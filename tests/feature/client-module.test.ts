import { describe, test, expect } from "bun:test";

describe("Client module smoke test", () => {
  test("client schema exports table", async () => {
    const schema = await import("../../src/modules/clients/schema.js");
    expect(schema.clients).toBeDefined();
  });

  test("client service exports CRUD functions", async () => {
    const service = await import("../../src/modules/clients/service.js");
    expect(service.getClients).toBeDefined();
    expect(service.getClientById).toBeDefined();
    expect(service.createClient).toBeDefined();
    expect(service.updateClient).toBeDefined();
    expect(service.deleteClient).toBeDefined();
  });

  test("client controller exports handlers", async () => {
    const controller = await import("../../src/modules/clients/controller.js");
    expect(controller.listClients).toBeDefined();
    expect(controller.getClient).toBeDefined();
    expect(controller.createClient).toBeDefined();
    expect(controller.updateClient).toBeDefined();
    expect(controller.deleteClient).toBeDefined();
  });

  test("client routes are registered", async () => {
    const { clientRoutes } = await import("../../src/modules/clients/routes.js");
    expect(clientRoutes).toBeDefined();
  });

  test("project schema has clientId column", async () => {
    const { project } = await import("../../src/modules/projects/schema.js");
    expect(project.clientId).toBeDefined();
  });

  test("project service uses client relation", async () => {
    const service = await import("../../src/modules/projects/service.js");
    expect(service.getProjects).toBeDefined();
    expect(service.getProjectById).toBeDefined();
    expect(service.createProject).toBeDefined();
  });
});
