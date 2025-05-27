import { api } from "./axios";
import type { Ad, ProductsResponse, PaginationParams } from "@/types/ads";

export const adsApi = {
  getAll: async ({
    limit = 9,
    skip = 0,
  }: PaginationParams): Promise<ProductsResponse> => {
    const { data } = await api.get<ProductsResponse>(
      `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
    );
    return data;
  },

  getById: async (id: string): Promise<Ad> => {
    const { data } = await api.get<Ad>(`https://dummyjson.com/products/${id}`);
    return data;
  },
};
