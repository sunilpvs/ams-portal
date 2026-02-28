import axiosInstance from "../../utils/axiosInstance";

// get paginated asset categories
export const getPaginatedAssetCategories = (page = 1, limit = 10) => {
  return axiosInstance.get(`api/ams/asset-categories?page=${page}&limit=${limit}`);
}

// get asset category combo list
export const getAssetCategoryCombo = (fields=['id', 'asset_category']) => {
  const fieldParams = fields.join(',');
  return axiosInstance.get(`api/ams/asset-categories?type=combo&fields=${fieldParams}`);
}

// get asset category by ID
export const getAssetCategoryById = (id) => {
  return axiosInstance.get(`api/ams/asset-categories?id=${id}`);
}

// add new asset category
export const addAssetCategory = (payload) => {
  return axiosInstance.post('api/ams/asset-categories', payload);
}

// edit asset category by ID
export const editAssetCategory = (id, payload) => {
    return axiosInstance.put(`api/ams/asset-categories?id=${id}`, payload);
}

// delete asset category by ID
export const deleteAssetCategory = (id) => {
    return axiosInstance.delete(`api/ams/asset-categories?id=${id}`);
}

// import asset categories via file upload
export const importAssetCategories = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(
        "api/ams/asset-categories",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}