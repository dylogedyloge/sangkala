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

export interface ProductsResponse {
  products: Ad[]
  total: number
  skip: number
  limit: number
}

export interface PaginationParams {
  limit: number
  skip: number
  search?: string
  category?: string
}