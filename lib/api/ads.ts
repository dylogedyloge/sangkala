import { api } from "./axios";
import type { Ad, ProductsResponse, PaginationParams } from "@/types/ads";

export const adsApi = {
  getAll: async ({
    limit = 9,
    skip = 0,
    search = "",
    category = "",
  }: PaginationParams): Promise<ProductsResponse> => {
    const baseUrl = "https://dummyjson.com/products";
    const url = search
      ? `${baseUrl}/search?q=${search}`
      : category
      ? `${baseUrl}/category/${category}`
      : baseUrl;
    
    const { data } = await api.get<ProductsResponse>(
      `${url}?limit=${limit}&skip=${skip}`
    );
    return data;
  },

  getById: async (id: string): Promise<Ad> => {
    const { data } = await api.get<Ad>(`https://dummyjson.com/products/${id}`);
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>("https://dummyjson.com/products/categories");
    return data;
  },
};
