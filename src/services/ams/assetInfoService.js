import axiosInstance from "../../utils/axiosInstance";

// get paginated asset info
export const getPaginatedAssetInfo = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/ams/asset-info?page=${page}&limit=${limit}`);
}

// get asset info combo list
export const assetInfoCombo = (fields = ['id', 'asset_serial_number']) => {
    const fieldParams = fields.join(",");
    return axiosInstance.get(`api/ams/asset-info?type=combo&fields=${fieldParams}`);
}

// get asset info by id
export const getAssetInfoById = (id) => {
    return axiosInstance.get(`api/ams/asset-info?id=${id}`);
}

// add new asset info
export const addAssetInfo = (payload) => {
    return axiosInstance.post('api/ams/asset-info', payload);
}

// edit asset info by id
export const editAssetInfo = (id, payload) => {
    return axiosInstance.put(`api/ams/asset-info?id=${id}`, payload);
}

// delete asset info by id
export const deleteAssetInfo = (id) => {
    return axiosInstance.delete(`api/ams/asset-info?id=${id}`);
}

// import asset info via file upload
export const importAssetInfo = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(
        "api/ams/asset-info",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}
