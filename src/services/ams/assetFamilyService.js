import axiosInstance from "../../utils/axiosInstance";

// get paginated asset families
export const getPaginatedAssetFamilies = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/ams/asset-families?page=${page}&limit=${limit}`);
};

// get asset families combo list
export const getAssetFamiliesCombo = (fields = ['id', 'family']) => {
    return axiosInstance.get(`api/ams/asset-families?type=combo&fields=${fields.join(',')}`);
}

// get asset family by ID
export const getAssetFamilyById = (id) => {
    return axiosInstance.get(`api/ams/asset-families?id=${id}`);
}

// add a new asset family
export const addAssetFamily = (payload) => {
    return axiosInstance.post('api/ams/asset-families', payload);
}

// update an existing asset family by ID
export const editAssetFamily = (id, payload) => {
    return axiosInstance.put(`api/ams/asset-families?id=${id}`, payload);
}


// delete an asset family by ID
export const deleteAssetFamily = (id) => {
    return axiosInstance.delete(`api/ams/asset-families?id=${id}`);
}

// import asset families via file upload
export const importAssetFamilies = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(
        "api/ams/asset-families",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}