const cookie = "better-auth.session_token=yncxxMLLc2uLfNoeaQ3Wgb6ItK7H3V2k.TIlrvOUhLAfXn0TVyJb+PqP/zk4uRy1LQi3Cu7mO5+I=";
const BASE = "http://localhost:8080";

async function test(name, url, method, body) {
  method = method || "GET";
  const headers = { "Cookie": cookie };
  if (body) headers["Content-Type"] = "application/json";
  
  try {
    const resp = await fetch(url, { method, headers, body });
    const text = await resp.text();
    const status = resp.status;
    const ok = status >= 200 && status < 300;
    console.log(ok ? "PASS" : "FAIL", name, "[" + status + "]");
    return { ok, status, text: JSON.parse(text) };
  } catch (err) {
    console.log("ERROR", name, err.message);
    return { ok: false, status: 0, text: { error: err.message } };
  }
}

console.log("=== FINAL COMPREHENSIVE TEST ===");

const signIn = await test("POST /api/auth/sign-in/email", BASE + "/api/auth/sign-in/email", "POST", JSON.stringify({email:"admin@ppms.local",password:"Admin12345"}));
const list = await test("GET /api/notifications", BASE + "/api/notifications");
const unread = await test("GET /api/notifications/unread-count", BASE + "/api/notifications/unread-count");
const fcm = await test("PUT /api/notifications/fcm-token", BASE + "/api/notifications/fcm-token", "PUT", JSON.stringify({fcmToken:"test-token-123"}));
const readAll = await test("PUT /api/notifications/read-all", BASE + "/api/notifications/read-all", "PUT");
const addMember = await test("POST /api/teams/{id}/members", BASE + "/api/teams/89ec8617-e37f-4ff7-af56-33db65d9e641/members", "POST", JSON.stringify({userId:"j5c8DTIB3F0WCUbmUWHEqWgWzfefdeck"}));
const createTask = await test("POST /api/tasks", BASE + "/api/tasks", "POST", JSON.stringify({projectId:"f383f6bb-0fba-4944-83e3-0990d277c19f",assigneeId:"j5c8DTIB3F0WCUbmUWHEqWgWzfefdeck",createdBy:"QItyRiLvTdq5lCiGxF1gn0AmJmHJnhW9",title:"Test Task",priority:"medium",status:"todo"}));
const testPush = await test("POST /api/notifications/test-push", BASE + "/api/notifications/test-push", "POST", JSON.stringify({fcmToken:"test-dummy-token",title:"Test",message:"Test push"}));
const health = await test("GET /health", BASE + "/health");
const openapi = await test("GET /openapi/json", BASE + "/openapi/json");

const { db } = await import("./src/db/index.js");
const { notification } = await import("./src/modules/notifications/schema.js");
const { eq } = await import("drizzle-orm");
const userNotifs = await db.select().from(notification).where(eq(notification.userId, "j5c8DTIB3F0WCUbmUWHEqWgWzfefdeck"));
console.log("Total notifications for added user:", userNotifs.length);
const types = {};
userNotifs.forEach(n => { types[n.type] = (types[n.type] || 0) + 1; });
console.log("Notification types:", types);

console.log("=== FINAL REPORT ===");
const allTests = [list, unread, fcm, readAll, addMember, createTask, testPush, health, openapi];
const passed = allTests.filter(t => t.ok).length;
console.log("Passed:", passed + "/" + allTests.length);
console.log(allTests.every(t => t.ok) ? "ALL TESTS PASSED" : "SOME TESTS FAILED");