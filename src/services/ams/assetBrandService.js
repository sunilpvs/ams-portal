import axiosInstance from "../../utils/axiosInstance";

/* ==============================
   GET APIs
============================== */

// Get paginated asset brands
export const getPaginatedAssetBrands = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/ams/asset-brands?page=${page}&limit=${limit}`);
};

// Get asset brand by ID
export const getAssetBrandById = (id) => {
    return axiosInstance.get(`api/ams/asset-brands?id=${id}`);
};

// Get asset brand combo list
export const getAssetBrandCombo = (fields = ['id', 'brand']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(
        `api/ams/asset-brands?type=combo&fields=${fieldParams}`
    );
};


/* ==============================
   CRUD APIs
============================== */

// Add a new asset brand
export const addAssetBrand = (payload) => {
    return axiosInstance.post('api/ams/asset-brands', payload);
};

// Update an existing asset brand by ID
export const editAssetBrand = (id, payload) => {
    return axiosInstance.put(`api/ams/asset-brands?id=${id}`, payload);
};

// Delete an asset brand by ID
export const deleteAssetBrand = (id) => {
    return axiosInstance.delete(`api/ams/asset-brands?id=${id}`);
};


/* ==============================
   IMPORT EXCEL API
============================== */

export const importAssetBrands = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.post(
        "api/ams/asset-brands/import",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
};
