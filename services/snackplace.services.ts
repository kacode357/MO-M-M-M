import { defaultAxiosInstance, skipNotiAxiosInstance } from '@/config/axios.customize';

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
// Interface for parameters to update a snack place
interface UpdateSnackPlaceParams {
  snackPlaceId: string;
  placeName: string;
  ownerName: string;
  address: string;
  email: string;
  phoneNumber: string;
  openingHour: string;
  description: string;
  coordinates: string;
  averagePrice: number;
image: string | null;
  businessModelId: string;
  tasteIds: string[];
  dietIds: string[];
  foodTypeIds: string[];
  mainDish: string;
}

// Function to create a snack place via API
const createSnackPlace = async (params: CreateSnackPlaceParams) => {
  const response = await defaultAxiosInstance.post('/api/SnackPlaces/create', params);
  return response.data;
};
// Function to get a snack place by ID via API
const getSnackPlaceById = async (id: string) => {
  const response = await skipNotiAxiosInstance.get(`/api/SnackPlaces/getById`, {
    params: { id },
  });
  return response.data;
};

// Function to update a snack place via API
const updateSnackPlace = async (params: UpdateSnackPlaceParams) => {
  const response = await defaultAxiosInstance.put('/api/SnackPlaces/update', params);
  return response.data;
};
export { createSnackPlace, getSnackPlaceById, updateSnackPlace };

