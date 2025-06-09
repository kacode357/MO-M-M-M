import {
  defaultAxiosInstance,
  skipAllNotiAxiosInstance,
  skipNotiAxiosInstance
} from "@/config/axios.customize";

const CreateUserApi = async (data: {
  fullName: string;
  email: string;
  userName: string;
  password: string;
}) => {
  const response = await defaultAxiosInstance.post(
    "/api/merchants/create",
    data
  );
  return response.data;
};

const LoginUserApi = async (data: { userName: string; password: string }) => {
  const response = await skipNotiAxiosInstance.post("/api/merchants/login", data);
  return response.data;
};
const CheckCreatedSnackplaceApi = async () => {
  const response = await skipAllNotiAxiosInstance.get(
    "/api/merchants/checkCreatedSnackplace"
  );
  return response.data;
};
export { CheckCreatedSnackplaceApi, CreateUserApi, LoginUserApi };

