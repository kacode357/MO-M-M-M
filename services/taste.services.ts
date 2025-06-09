import { defaultAxiosInstance, skipNotiAxiosInstance } from '@/config/axios.customize';

const createTaste = async (data: { name: string }) => {
    const response = await defaultAxiosInstance.post('/api/Taste/create', data);
    return response.data;
};

const searchTaste = async (params: { pageNum: number; pageSize: number; searchKeyword: string; status: boolean }) => {
    const response = await skipNotiAxiosInstance.post('/api/Taste/search', params);
    return response.data;
};

const getTasteById = async (id: string) => {
    const response = await defaultAxiosInstance.get('/api/Taste/getById', { params: { id } });
    return response.data;
};

const updateTaste = async (data: { id: string; name: string }) => {
    const response = await defaultAxiosInstance.put('/api/Taste/update', data);
    return response.data;
};

const deleteTaste = async (id: string) => {
    const response = await defaultAxiosInstance.delete('/api/Taste/delete', { params: { id } });
    return response.data;
};

export {
    createTaste, deleteTaste, getTasteById, searchTaste, updateTaste
};

