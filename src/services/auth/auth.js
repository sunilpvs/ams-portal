import axiosInstance from "../../utils/axiosInstance.js";
import { getAMSAccessStatus } from "../admin/accessReqService";

// ------------------
// Login
// ------------------
const loginUser = async ({ username, password }) => {
  return await axiosInstance.post("auth/login.php", { username, password });
};

export default loginUser;

// ------------------
// Logout
// ------------------
export const logoutUser = async () => {
  try {
    await axiosInstance.post("auth/logout.php");
  } catch (error) {
    console.error("Logout failed", error);
  } finally {
    window.location.href = "/login";
  }
};

// ------------------
// Auth + Access Flow
// ------------------
export const checkAuth = async () => {
  try {
    const authRes = await axiosInstance.get("auth/check.php");

    if (authRes.status !== 200) {
      return { authenticated: false };
    }

    const accessRes = await getAMSAccessStatus();

    return {
      authenticated: true,
      status: accessRes.status || "no_request"
    };

  } catch (err) {
    if (err.response?.status === 401) {
      return { authenticated: false };
    }

    console.error("checkAuth failed:", err);
    return { authenticated: false };
  }
};