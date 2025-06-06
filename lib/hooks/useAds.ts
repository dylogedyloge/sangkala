import { useQuery } from "@tanstack/react-query";
import { adsApi } from "@/lib/api/ads";

export const adsKeys = {
  all: ["ads"] as const,
  lists: () => [...adsKeys.all, "list"] as const,
  list: (filters: string) => [...adsKeys.lists(), { filters }] as const,
  details: () => [...adsKeys.all, "detail"] as const,
  detail: (id: string) => [...adsKeys.details(), id] as const,
};

interface Product {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand?: string
  category: string
  thumbnail: string
  images: string[]
  availabilityStatus: string
}

interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

type SortOrder = "lowest" | "highest" | "default"

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("https://dummyjson.com/products/category-list")
      const data = await res.json()
      return data
    },
  })
}

export const useAds = (
  page: number,
  limit: number,
  search?: string,
  category?: string,
  brand?: string,
  onlyInStock?: boolean,
  sortByPrice?: "lowest" | "highest" | null
) => {
  const skip = (page - 1) * limit

  return useQuery<ProductsResponse>({
    queryKey: ["products", page, limit, search, category, brand, onlyInStock, sortByPrice],
    queryFn: async () => {
      // If we need sorting, or have multiple filters, fetch all products
      if (sortByPrice || (brand && brand !== "all") || onlyInStock || (search && category && category !== "all")) {
        const allProductsRes = await fetch("https://dummyjson.com/products?limit=0")
        const allData: ProductsResponse = await allProductsRes.json()
        
        // Apply all filters
        let filteredProducts = allData.products

        // Filter by brand if specified
        if (brand && brand !== "all") {
          filteredProducts = filteredProducts.filter(product => product.brand === brand)
        }

        // Filter by category if specified
        if (category && category !== "all") {
          filteredProducts = filteredProducts.filter(product => product.category === category)
        }

        // Filter by availability if specified
        if (onlyInStock) {
          filteredProducts = filteredProducts.filter(product => 
            product.availabilityStatus === "In Stock"
          )
        }

        // Handle search if needed
        if (search) {
          filteredProducts = filteredProducts.filter(product => 
            product.title.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase())
          )
        }

        // Apply price sorting
        if (sortByPrice) {
          filteredProducts.sort((a: Product, b: Product) => {
            if (sortByPrice === "lowest") {
              return a.price - b.price
            } else {
              return b.price - a.price
            }
          })
        }

        // Manual pagination
        const paginatedProducts = filteredProducts.slice(skip, skip + limit)
        
        return {
          products: paginatedProducts,
          total: filteredProducts.length,
          skip,
          limit
        }
      }

      // For simple category or search queries without sorting, use the API endpoints
      let url = "https://dummyjson.com/products"
      
      if (category && category !== "all") {
        url = `https://dummyjson.com/products/category/${category}`
      } else if (search) {
        url = "https://dummyjson.com/products/search"
      }

      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString(),
      })

      if (search && url === "https://dummyjson.com/products/search") {
        queryParams.append("q", search)
      }

      const finalUrl = `${url}?${queryParams}`
      const res = await fetch(finalUrl)
      const data = await res.json()

      return data
    },
  })
}

export function useAd(id: string) {
  return useQuery({
    queryKey: adsKeys.detail(id),
    queryFn: () => adsApi.getById(id),
  });
}

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      // Fetch all products to get unique brands
      const res = await fetch("https://dummyjson.com/products?limit=0")
      const data: ProductsResponse = await res.json()
      
      // Extract unique brands, filter out undefined/null, and sort alphabetically
      const uniqueBrands = Array.from(
        new Set(
          data.products
            .map((product) => product.brand)
            .filter((brand): brand is string => !!brand)
        )
      ).sort()

      return uniqueBrands
    },
  })
}
