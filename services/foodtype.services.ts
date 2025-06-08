import { defaultAxiosInstance } from '@/config/axios.customize';

const createFoodType = async (data: { name: string }) => {
    const response = await defaultAxiosInstance.post('/api/FoodType/create', data);
    return response.data;
};

const searchFoodType = async (params: { pageNum: number; pageSize: number; searchKeyword: string; status: boolean }) => {
    const response = await defaultAxiosInstance.post('/api/FoodType/search', params);
    return response.data;
};

const getFoodTypeById = async (id: string) => {
    const response = await defaultAxiosInstance.get('/api/FoodType/getById', { params: { id } });
    return response.data;
};

const updateFoodType = async (data: { id: string; name: string }) => {
    const response = await defaultAxiosInstance.put('/api/FoodType/update', data);
    return response.data;
};

const deleteFoodType = async (id: string) => {
    const response = await defaultAxiosInstance.delete('/api/FoodType/delete', { params: { id } });
    return response.data;
};

export {
    createFoodType, deleteFoodType, getFoodTypeById, searchFoodType, updateFoodType
};
