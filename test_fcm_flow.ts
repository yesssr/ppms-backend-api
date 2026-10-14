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
    console.log("  " + text.substring(0, 200));
    return { ok, status, text: JSON.parse(text) };
  } catch (err) {
    console.log("ERROR", name, err.message);
    return { ok: false, status: 0, text: { error: err.message } };
  }
}

console.log("=== FCM Full Flow Test ===");

// 1. Sign in
await test("Sign in", BASE + "/api/auth/sign-in/email", "POST", JSON.stringify({email:"admin@ppms.local",password:"Admin12345"}));

// 2. Update FCM token (simulating what browser would send)
await test("Update FCM token", BASE + "/api/notifications/fcm-token", "PUT", JSON.stringify({fcmToken:"browser-fcm-token-abc123"}));

// 3. Trigger test push with that token
const pushResult = await test("Test push", BASE + "/api/notifications/test-push", "POST", JSON.stringify({fcmToken:"browser-fcm-token-abc123", title:"Test", message:"Test push from PPMS"}));
console.log("Push result:", JSON.stringify(pushResult.text));

// 4. Verify token was saved
const dbMod = await import("./src/db/index.js");
const userMod = await import("./src/modules/auth/schema.js");
const drizzle = await import("drizzle-orm");
const db = dbMod.db;
const user = userMod.user;
const eq = drizzle.eq;
const [u] = await db.select().from(user).where(eq(user.email, "admin@ppms.local"));
console.log("User FCM token in DB:", u?.fcmToken);

console.log("=== Test Complete ===");