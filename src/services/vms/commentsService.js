import axiosInstance from "../../utils/axiosInstance";

export const getPreviousComments = (reference_id) => {
    return axiosInstance.get(`api/vms/comments?reference_id=${reference_id}&type=previous`);
}

export const addComments = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/comments?reference_id=${reference_id}`, payload);
}