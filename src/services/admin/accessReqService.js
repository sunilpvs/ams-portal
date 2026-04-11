import axiosInstance from "../../utils/axiosInstance";

export const getPaginatedAccessRequests = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/admin/access-request?page=${page}&limit=${limit}`);
}

export const sendAccessRequest = (payload) => {
    return axiosInstance.post(`api/admin/access-request`, payload);
}

export const getAMSAccessStatus = async () => {
    try {
        const res = await axiosInstance.get("auth/access-status.php?type=ams");

        return { status: "granted" };

    } catch (err) {
        if (err.response?.status === 403) {
            return {
                status: err?.response?.data?.req_status?.toLowerCase() // already normalized
            };
        }

        throw err;
    }
};

export const getEmailFromToken = () => {
    return axiosInstance.get(`api/admin/access-request?type=email`);
}

