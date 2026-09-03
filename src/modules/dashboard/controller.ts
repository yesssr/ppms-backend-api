import { success, error } from "../../utils/response.js";
import { getDashboard } from "./service.js";

export async function getDashboardData() {
  try {
    const data = await getDashboard();
    return success(data, "Dashboard data retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve dashboard data", "FETCH_DASHBOARD_ERROR");
  }
}
