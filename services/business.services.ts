import { skipNotiAxiosInstance } from '@/config/axios.customize';

const searchBusinessModels = async (params: { pageNum: number; pageSize: number; searchKeyword: string; status: boolean }) => {
        const response = await skipNotiAxiosInstance.post('/api/BusinessModels/search', params);
        return response.data;
};

export {
    searchBusinessModels
};

