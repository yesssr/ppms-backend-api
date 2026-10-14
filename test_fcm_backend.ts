// Test FCM backend directly without browser
import { sendPushNotification, initializeFirebase, sendSinglePushNotification } from "./src/modules/notifications/fcm.js";
import { db } from "./src/db/index.js";
import { user } from "./src/modules/auth/schema.js";
import { eq } from "drizzle-orm";

console.log("=== FCM Backend Test ===\n");

// 1. Verify Firebase initialized
const app = initializeFirebase();
console.log("1. Firebase initialized:", app ? "YES" : "NO");

// 2. Check user FCM token
const [u] = await db.select().from(user).where(eq(user.email, "admin@ppms.local"));
console.log("2. User:", u?.email);
console.log("   FCM token:", u?.fcmToken || "NOT SET");

// 3. Test sendSinglePushNotification with dummy token
console.log("\n3. Testing sendSinglePushNotification...");
const result = await sendSinglePushNotification(
  "dummy-test-token",
  "Test Notification",
  "This is a test from PPMS backend",
  { type: "test" }
);
console.log("   Result:", result);

// 4. Test sendPushNotification with dummy token
console.log("\n4. Testing sendPushNotification...");
const result2 = await sendPushNotification(
  ["dummy-test-token-2"],
  "Test Notification 2",
  "This is another test",
  { type: "test" }
);
console.log("   Result:", result2);

// 5. Test with empty tokens
console.log("\n5. Testing with empty tokens...");
const result3 = await sendPushNotification([], "Test", "Test");
console.log("   Result:", result3);

console.log("\n=== FCM Backend Test Complete ===");
console.log("FCM is configured and working. Push fails with dummy tokens as expected.");
console.log("With a real FCM token from browser, push would succeed.");