import { skipNotiAxiosInstance } from '@/config/axios.customize';

const getAllReviewsAndReplies = async () => {
  const response = await skipNotiAxiosInstance.get('/api/reviews/getAllReviewsAndReplies');
  return response.data;
};
const createReply = async (data: {
  reviewId: string;
  parentReplyId?: string | null; // Sửa từ string | undefined thành string | null
  comment: string;
  userId: string;
}) => {
    const response = await skipNotiAxiosInstance.post('/api/Reply/create', data);
    return response.data;
};
export {
    createReply, getAllReviewsAndReplies
};

