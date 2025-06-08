import { defaultAxiosInstance } from '@/config/axios.customize';

// Interface for parameters to create a snack place
interface CreateSnackPlaceParams {
  userId: string;
  placeName: string;
  ownerName: string;
  address: string;
  email: string;
  coordinates: string;
  openingHour: string;
  averagePrice: number;
  image: string;
  mainDish: string;
  phoneNumber: string;
  businessModelId: string;
  tasteIds: string[];
  dietIds: string[];
  foodTypeIds: string[];
  description: string; // Added field for snack place description
}

// Function to create a snack place via API
const createSnackPlace = async (params: CreateSnackPlaceParams) => {
  const response = await defaultAxiosInstance.post('/api/SnackPlaces/create', params);
  return response.data;
};

export { createSnackPlace };
