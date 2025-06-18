import { defaultAxiosInstance, skipNotiAxiosInstance } from '@/config/axios.customize';

const createPremiumPackage = async (data: { name: string; price: number; descriptions: string[] }) => {
    const response = await defaultAxiosInstance.post('/api/PremiumPackage/create', data);
    return response.data;
};

const getPremiumPackageById = async (id: string) => {
    const response = await skipNotiAxiosInstance.get('/api/PremiumPackage/getById', { params: { id } });
    return response.data;
};

const searchPremiumPackage = async (params: { pageNum: number; pageSize: number; searchKeyword: string; status: boolean }) => {
    const response = await skipNotiAxiosInstance.post('/api/PremiumPackage/search', params);
    return response.data;
};

const updatePremiumPackage = async (id: string, data: { name: string; price: number; descriptions: string[] }) => {
    const response = await defaultAxiosInstance.put(`/api/PremiumPackage/update?id=${id}`, data);
    return response.data;
};

const deletePremiumPackage = async (id: string) => {
    const response = await defaultAxiosInstance.delete('/api/PremiumPackage/delete', { params: { id } });
    return response.data;
};

export {
    createPremiumPackage, deletePremiumPackage, getPremiumPackageById,
    searchPremiumPackage,
    updatePremiumPackage
};

