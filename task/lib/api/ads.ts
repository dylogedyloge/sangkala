import { api } from './axios'

export interface Review {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface Dimensions {
  width: number
  height: number
  depth: number
}

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
  tags: string[]
  sku: string
  weight: number
  dimensions: Dimensions
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: Review[]
  returnPolicy: string
  minimumOrderQuantity: number
  images: string[]
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