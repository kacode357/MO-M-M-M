import { skipAllNotiAxiosInstance, skipNotiAxiosInstance } from '@/config/axios.customize';

const createPayment = async (premiumPackageId: number) => {
        const response = await skipNotiAxiosInstance.post('/api/Payment/create', {
            premiumPackageId
        });
        return response.data;
};
const checkPaymentStatus = async (paymentId: string) => {
    const response = await skipAllNotiAxiosInstance.get(`/api/Payment/checkStatus`, {
        params: { paymentId }
    });
    return response.data;
};
const getPaymentHistory = async () => {
    const response = await skipNotiAxiosInstance.get('/api/Payment/paymentHistory');
    return response.data;
};
const hasPackage = async () => {
    const response = await skipNotiAxiosInstance.get('/api/Payment/hasPackage');
    return response.data;
};
export { checkPaymentStatus, createPayment, getPaymentHistory, hasPackage };

