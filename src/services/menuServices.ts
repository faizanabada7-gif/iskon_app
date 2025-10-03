// services/menuServices.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.47:5000", 
  timeout: 10000,
});

export interface CategoryQuery {
  page?: number;
  limit?: number;
  username?: string;
  role?: string;
  status?: string;
}

export const getCategory = (query: CategoryQuery, token?: string) =>
  API.get("/category", {
    params: query,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });


export const getCategoryById = (id: string) =>
  API.get(`/categories/${id}`);

export const getCategoryWiseMenu = async (params?: Record<string, any>, token?: string) => {
  const categoryId = params?.categoryId;
  const url = categoryId ? `/menu/${categoryId}` : `/menu`; // <-- if no category, just /menu
  return API.get(url, {
    params: params || {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const deleteCategory = (id: string) =>
  API.delete(`/categories/${id}`);

export const addCategory = (data: any) => API.post("/category", data);
export const updateCategory = (id: string, data: any) => API.put(`/category/${id}`, data);

export default API;
