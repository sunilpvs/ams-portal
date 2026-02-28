import axiosInstance from "../../utils/axiosInstance";

// get paginated assignment types
export const getPaginatedAssignmentTypes = async (page, limit) => {
    return axiosInstance.get(`api/ams/assignment-types?page=${page}&limit=${limit}`);
}

// get assignments types combo list
export const getAssignmentTypesCombo = (fields = ['id', 'assignment_type']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(`api/ams/assignment-types?type=combo&fields=${fieldParams}`);
}

// get assignment type by id
export const getAssignmentTypeById = (id) => {
    return axiosInstance.get(`api/ams/assignment-types?id=${id}`);
}

// add new assignment type
export const addAssignmentType = (payload) => {
    return axiosInstance.post('api/ams/assignment-types', payload);
}

// edit assignment type by id
export const editAssignmentType = (id, payload) => {
    return axiosInstance.put(`api/ams/assignment-types?id=${id}`, payload);
}

// delete assignment type by id
export const deleteAssignmentType = (id) => {
    return axiosInstance.delete(`api/ams/assignment-types?id=${id}`);
}

// import assignment types via file upload
export const importAssignmentTypes = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.post(
        "api/ams/assignment-types",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}