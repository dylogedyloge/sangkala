import { api } from './axios'

export interface Ad {
  id: number
  title: string
  description: string
  price: number
  thumbnail: string
  category: string
  brand: string
  rating: number
  stock: number
  discountPercentage: number
}

interface ProductsResponse {
  products: Ad[]
  total: number
  skip: number
  limit: number
}

export interface PaginationParams {
  limit: number;
  skip: number;
}

export const adsApi = {
  getAll: async ({ limit = 9, skip = 0 }: PaginationParams): Promise<ProductsResponse> => {
    const { data } = await api.get<ProductsResponse>(
      `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
    )
    return data
  },
  
  getById: async (id: string): Promise<Ad> => {
    const { data } = await api.get<Ad>(`https://dummyjson.com/products/${id}`)
    return data
  }
}