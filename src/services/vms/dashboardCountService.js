import axiosInstance from "../../utils/axiosInstance";

export const getSubmittedRfqCount = () => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=submitted-rfq-count`);
}

export const getActiveVendorCount = () => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=active-vendor-count`);
}