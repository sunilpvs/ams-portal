import axiosInstance from "../../utils/axiosInstance";

// Get paginated asset models
export const getPaginatedAssetModels =  (page=1, limit=10) => {
    return axiosInstance.get(`api/ams/asset-models?page=${page}&limit=${limit}`);
}

// Get asset model by ID
export const getAssetModelById = (id) => {
    return axiosInstance.get(`api/ams/asset-models?id=${id}`);
}


// Get asset model combo list
export const getAssetModelCombo = (fields = ['id', 'asset_model']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(
        `api/ams/asset-models?type=combo&fields=${fieldParams}`
    );
}

// Add a new asset model
export const addAssetModel = (payload) => {
    return axiosInstance.post('api/ams/asset-models', payload);
}

// Update an existing asset model by ID
export const editAssetModel = (id, payload) => {
    return axiosInstance.put(`api/ams/asset-models?id=${id}`, payload);
}

// Delete an asset model by ID
export const deleteAssetModel = (id) => {
    return axiosInstance.delete(`api/ams/asset-models?id=${id}`);
}

// Import asset models via file upload
export const importAssetModels = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(
        "api/ams/asset-models",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}
