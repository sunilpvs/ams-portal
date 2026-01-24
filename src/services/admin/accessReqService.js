import axiosInstance from "../../utils/axiosInstance";

export const getPaginatedAccessRequests = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/admin/access-request?page=${page}&limit=${limit}`);
}

export const sendAccessRequest = (payload) => {
    return axiosInstance.post(`api/admin/access-request`, payload);
}

export const getVMSAccessStatus = () => {
    return axiosInstance.get(`auth/access-status.php?type=vms`);
}

export const getEmailFromToken = () => {
    return axiosInstance.get(`api/admin/access-request?type=email`);
}

