import axiosInstance from "../../utils/axiosInstance";

export const getReferenceId = () => {
    return axiosInstance.get('api/vms/reference-id?type=reference_id');
}

export const getVendorId = (referenceId) => {
    return axiosInstance.get(`api/vms/reference-id?type=vendor_id&reference_id=${referenceId}`);
}

export const getRfqStatus = (referenceId) => {
    return axiosInstance.get(`api/vms/rfq-reference?type=status&reference_id=${referenceId}`);
}
