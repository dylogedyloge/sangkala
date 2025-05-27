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

export const adsApi = {
  getAll: async (): Promise<Ad[]> => {
    const { data } = await api.get<ProductsResponse>('https://dummyjson.com/products')
    return data.products
  },
  
  getById: async (id: string): Promise<Ad> => {
    const { data } = await api.get<Ad>(`https://dummyjson.com/products/${id}`)
    return data
  }
}