import axiosInstance from "../../utils/axiosInstance";

// get paginated asset types
export const getPaginatedAssetTypes = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/ams/asset-types?page=${page}&limit=${limit}`);
}

// get asset type combo list
export const getAssetTypeCombo = (fields = ['id', 'asset_type']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(
        `api/ams/asset-types?type=combo&fields=${fieldParams}`
    );
}

// get asset type by ID
export const getAssetTypeById = (id) => {
    return axiosInstance.get(`api/ams/asset-types?id=${id}`);
}

// get asset types based on category ID
export const getAssetTypeBasedOnCategoryId = (categoryId) => {
    return axiosInstance.get(`api/ams/asset-types?type=filter&category_id=${categoryId}`);
}

// add new asset type
export const addAssetType = (payload) => {
    return axiosInstance.post('api/ams/asset-types', payload);
}

// update asset type by ID
export const editAssetType = (id, payload) => {
    return axiosInstance.put(`api/ams/asset-types?id=${id}`, payload);
}

// delete asset type by ID
export const deleteAssetType = (id) => {
    return axiosInstance.delete(`api/ams/asset-types?id=${id}`);
}

// import asset types via file upload
export const importAssetTypes = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(
        "api/ams/asset-types",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}

