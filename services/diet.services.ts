import { defaultAxiosInstance } from '@/config/axios.customize';

 const createDiet = async (data: { name: string }) => {
    const response = await defaultAxiosInstance.post('/api/Diet/create', data);
    return response.data;
};
 const searchDiet = async (params: { pageNum: number; pageSize: number; searchKeyword: string; status: boolean }) => {
   
        const response = await defaultAxiosInstance.post('/api/Diet/search', params);
        return response.data;
   
};
 const getDietById = async (id: string) => {
    const response = await defaultAxiosInstance.get(`/api/Diet/getById`, { params: { id } });
    return response.data;
};
 const updateDiet = async (data: { id: string; name: string }) => {
    const response = await defaultAxiosInstance.put('/api/Diet/update', data);
    return response.data;
};
 const deleteDiet = async (id: string) => {
    const response = await defaultAxiosInstance.delete('/api/Diet/delete', { params: { id } });
    return response.data;
};
export {
    createDiet, deleteDiet, getDietById, searchDiet, updateDiet
};

