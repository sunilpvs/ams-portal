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

        const reqStatus = res.data?.req_status?.toString().toLowerCase();
        const message = res.data?.message?.toString().toLowerCase();

        if (reqStatus) {
            return { status: reqStatus };
        }

        if (message?.includes("granted")) {
            return { status: "granted" };
        }

        if (message?.includes("pending")) {
            return { status: "submitted" };
        }

        return { status: "no_request" };

    } catch (err) {
        if (err.response?.status === 403) {
            const reqStatus = err.response?.data?.req_status?.toString().toLowerCase();

            return {
                status: reqStatus || "no_request"
            };
        }

        throw err;
    }
};

export const getEmailFromToken = () => {
    return axiosInstance.get(`api/admin/access-request?type=email`);
}

