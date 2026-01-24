import axiosInstance from "../../utils/axiosInstance";

export const sendBackRfqForCorrections = (reference_id) => {
    return axiosInstance.post(`api/vms/rfq-review?action=send-back&reference_id=${reference_id}`);
}

// approve rfq and set expiry date
export const approveRfq = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/rfq-review?action=approve&reference_id=${reference_id}`, payload);
}

// reject rfq
export const rejectRfq = (reference_id) => {
    return axiosInstance.post(`api/vms/rfq-review?action=reject&reference_id=${reference_id}`);
}

// verify rfq details
export const verifyRfq = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/rfq-review?action=verify&reference_id=${reference_id}`, payload);
}

// submit/resubmit rfq for review
export const submitRfq = (reference_id) => {
    return axiosInstance.post(`api/vms/rfq-review?action=submit&reference_id=${reference_id}`);
};


// reinitiate vendor with new rfq
export const reinitiateVendor = (vendor_code) => {
    return axiosInstance.post(`api/vms/rfq-review?action=reinitiate`, { vendor_code });
}

