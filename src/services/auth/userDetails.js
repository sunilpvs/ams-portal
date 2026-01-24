import axiosInstance from "../../utils/axiosInstance";


export const getUserDetails =  () => {
    return axiosInstance.get('api/user/me');
}

export const getVmsUserRole = () => {
    return axiosInstance.get('api/user/role?type=vms');
}