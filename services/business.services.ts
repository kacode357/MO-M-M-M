import { defaultAxiosInstance } from '@/config/axios.customize';

const searchBusinessModels = async (params: { pageNum: number; pageSize: number; searchKeyword: string; status: boolean }) => {
        const response = await defaultAxiosInstance.post('/api/BusinessModels/search', params);
        return response.data;
};

export {
    searchBusinessModels
};

