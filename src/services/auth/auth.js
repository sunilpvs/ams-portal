import axiosInstance from "../../utils/axiosInstance.js";
import {getVMSAccessStatus} from "../admin/accessReqService";


// ------------------
// Login
// ------------------
const loginUser = async ({ username, password }) => {
  const payload = { username, password };
  return await axiosInstance.post("auth/login.php", payload);
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


export const checkAuth = async () => {
  try {
    const auth_response = await axiosInstance.get("auth/check.php?portal=vms");

    if (auth_response?.status === 200) {
      try {
        const access_response = await getVMSAccessStatus();

        if (access_response?.status === 200) {
          return { authenticated: true, status: "Granted" };
        }
      } catch (accessErr) {
        if (accessErr.response?.status === 403) {
          const reqStatus = accessErr.response?.data?.req_status;
          return { authenticated: true, status: reqStatus };
        }
        throw accessErr; // other errors bubble up
      }
    }

    return { authenticated: false, status: null };
  } catch (err) {
    console.error("checkAuth failed:", err);
    return { authenticated: false, status: null };
  }
};



