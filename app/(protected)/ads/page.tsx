"use client"
import { useState, useEffect, Suspense } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { redirect, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/shadcn/button"
import { Card } from "@/components/shadcn/card"
import { useAds, useBrands, useCategories } from "@/lib/hooks/useAds"
import { ProductCardSkeleton } from "@/components/ads/product-card-skeleton"
import { Input } from "@/components/shadcn/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { Checkbox } from "@/components/shadcn/checkbox"
import { Label } from "@/components/shadcn/label"
import { ArrowUpDown, Bell, ChevronDown, Menu, Plus, Heart, UserCircle2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Circle } from "lucide-react"
import { Home, MessageSquare,  BookmarkIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

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

const ITEMS_PER_PAGE = 9
const ALL_CATEGORIES = "all"
const ALL_BRANDS = "all"

type SortOrder = "lowest" | "highest" | "default"

const formatCategoryName = (category: string): string => {
  return category
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#F333FF"];

const getStockBadgeColor = (status: string) => {
  switch (status) {
    case "In Stock":
      return "bg-green-500";
    case "Low Stock":
      return "bg-yellow-500";
    default:
      return "bg-red-500";
  }
};

// Create a new component for search params logic
function SearchParamsComponent({ 
  onSearchChange, 
  onCategoryChange, 
  onBrandChange, 
  onInStockChange, 
  onSortChange 
}: { 
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onBrandChange: (value: string) => void
  onInStockChange: (value: boolean) => void
  onSortChange: (value: SortOrder) => void
}) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    onSearchChange(searchParams.get("q") || "")
    onCategoryChange(searchParams.get("category") || ALL_CATEGORIES)
    onBrandChange(searchParams.get("brand") || ALL_BRANDS)
    onInStockChange(searchParams.get("inStock") === "true")
    onSortChange((searchParams.get("sort") as SortOrder) || "default")
  }, [searchParams, onSearchChange, onCategoryChange, onBrandChange, onInStockChange, onSortChange])

  return null
}

export default function AdsPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)
  const [selectedBrand, setSelectedBrand] = useState(ALL_BRANDS)
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [priceSort, setPriceSort] = useState<SortOrder>("default")

  // Add back URL updating effect
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set("q", searchQuery)
    }
    if (selectedCategory && selectedCategory !== ALL_CATEGORIES) {
      params.set("category", selectedCategory)
    }
    if (selectedBrand && selectedBrand !== ALL_BRANDS) {
      params.set("brand", selectedBrand)
    }
    if (onlyInStock) {
      params.set("inStock", "true")
    }
    if (priceSort !== "default") {
      params.set("sort", priceSort)
    }
    router.replace(`/ads?${params.toString()}`)
  }, [searchQuery, selectedCategory, selectedBrand, onlyInStock, priceSort, router])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedBrand, onlyInStock, priceSort])

  const togglePriceSort = () => {
    setPriceSort(current => {
      if (current === "default" || current === "highest") return "lowest"
      return "highest"
    })
  }

  const { isAuthenticated, logout } = useAuthStore()
  const { data: brands = [], isLoading: isBrandsLoading } = useBrands()
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
  const { data, isLoading, error } = useAds(
    currentPage, 
    ITEMS_PER_PAGE, 
    searchQuery, 
    selectedCategory === ALL_CATEGORIES ? undefined : selectedCategory,
    selectedBrand === ALL_BRANDS ? undefined : selectedBrand,
    onlyInStock,
    priceSort === "default" ? null : priceSort
  )

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE)

  if (!isAuthenticated) {
    redirect("/login")
  }

  if (error) {
    return <div className="min-h-screen p-8">Error loading ads</div>
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between p-3.5 border-b bg-background">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48" sideOffset={8}>
              <DropdownMenuItem>
                <Home className="w-4 h-4 mr-2" />
                <span>Home</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookmarkIcon className="w-4 h-4 mr-2" />
                <span>Bookmarks</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3">
            <Select defaultValue="metric">
              <SelectTrigger className="w-[90px] border-0 text-[13px] font-medium bg-transparent h-8">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent position="item-aligned" align="center" sideOffset={8}>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="imperial">Imperial</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="en">
              <SelectTrigger className="w-[70px] border-0 text-[13px] font-medium bg-transparent h-8">
                <SelectValue placeholder="EN" />
              </SelectTrigger>
              <SelectContent position="item-aligned" align="center" sideOffset={8}>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ar">AR</SelectItem>
                <SelectItem value="fa">FA</SelectItem>
              </SelectContent>
            </Select>

            <ThemeToggle />
          </div>

          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block border-b bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center h-16 gap-8">
              {/* Logo */}
              <div className="font-semibold text-lg shrink-0">Hajjar Ads</div>

              {/* Navigation */}
              <nav className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  Home
                </Button>
                <Button variant="ghost" className="text-muted-foreground">
                  Bookmark
                </Button>
              </nav>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search Anything.."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-full"
                  />
                  <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Button variant="ghost" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shrink-0">
                  Create Advertisement
                </Button>

                <Select defaultValue="metric">
                  <SelectTrigger className="w-[100px] border-0 text-sm font-medium bg-transparent">
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" align="center" sideOffset={8}>
                    <SelectItem value="metric">Metric</SelectItem>
                    <SelectItem value="imperial">Imperial</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="en">
                  <SelectTrigger className="w-[80px] border-0 text-sm font-medium bg-transparent">
                    <SelectValue placeholder="EN" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" align="center" sideOffset={8}>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="ar">AR</SelectItem>
                    <SelectItem value="fa">FA</SelectItem>
                  </SelectContent>
                </Select>

                <ThemeToggle />

                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
                </Button>

                <div className="flex items-center gap-2 pl-2 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-muted overflow-hidden relative shrink-0">
                    <Image
                      src="/avatar-placeholder.jpg"
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">Ali Motiei</p>
                      <p className="text-xs text-muted-foreground">ali@example.com</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Spacer */}
      <div className="h-[56px] md:h-[64px]"></div>

      {/* Main Content Container */}
      <div className="w-full overflow-x-hidden">
        {/* Mobile Search */}
        <div className="md:hidden px-4 py-3">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search Anything.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-full bg-muted/50 border-0 text-[13px]"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Button variant="ghost" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden px-4 space-y-3 pb-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full bg-background text-[13px] border-input">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value={ALL_CATEGORIES}>All Categories</SelectItem>
              {!isCategoriesLoading && categories.map((category:string) => (
                <SelectItem key={category} value={category}>
                  {formatCategoryName(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-full bg-background text-[13px] border-input">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value={ALL_BRANDS}>All Brands</SelectItem>
              {!isBrandsLoading && brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 px-1">
            <Checkbox 
              id="inStockMobile" 
              checked={onlyInStock}
              onCheckedChange={(checked: boolean | "indeterminate") => setOnlyInStock(checked === true)}
              className="h-4 w-4 border-input"
            />
            <Label htmlFor="inStockMobile" className="text-[13px] text-foreground">Only In Stock</Label>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 relative w-full">
          {/* Desktop Filters */}
          <div className="hidden md:flex gap-4 my-6 flex-wrap items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value={ALL_CATEGORIES}>All Categories</SelectItem>
                {!isCategoriesLoading && categories.map((category:string) => (
                  <SelectItem key={category} value={category}>
                    {formatCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value={ALL_BRANDS}>All Brands</SelectItem>
                {!isBrandsLoading && brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={togglePriceSort}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>
                {priceSort === "lowest" ? "Price: Ascending" : 
                 priceSort === "highest" ? "Price: Descending" : 
                 "Sort by Price"}
              </span>
            </Button>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="inStock" 
                checked={onlyInStock}
                onCheckedChange={(checked: boolean | "indeterminate") => setOnlyInStock(checked === true)}
              />
              <Label htmlFor="inStock">Only In Stock</Label>
            </div>
          </div>

          {/* Product Cards */}
          <div className="space-y-4 px-4 md:px-0">
            {isLoading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) :
            (data?.products.map((ad: Product) => (
              <Card key={ad.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row md:gap-8">
                  <div className="relative w-full md:w-[300px] h-[180px] md:h-[240px] flex-shrink-0">
                    <div className="absolute top-3 left-3 z-10">
                      <span className={cn(
                        "text-[13px] md:text-xs font-medium px-2.5 py-1 md:px-3 md:py-1.5 rounded-md",
                        getStockBadgeColor(ad.availabilityStatus)
                      )}>
                        {ad.availabilityStatus}
                      </span>
                    </div>
                    <Image
                      src={ad.thumbnail}
                      alt={ad.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 md:p-6 md:pr-8 space-y-4 md:space-y-5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold tracking-tight mb-1.5 md:mb-2">{ad.title}</h2>
                        <div className="flex items-center flex-wrap gap-1.5 md:gap-2">
                          <p className="text-[13px] md:text-sm text-muted-foreground">Account User</p>
                          <span className="text-[13px] md:text-sm bg-primary/10 text-primary px-2.5 py-0.5 md:px-3 md:py-1 rounded-full font-medium">
                            {formatCategoryName(ad.category)}
                          </span>
                          {ad.brand && (
                            <span className="text-[13px] md:text-sm bg-primary text-secondary px-2.5 py-0.5 md:px-3 md:py-1 rounded-full font-medium">
                              {ad.brand}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 md:gap-1.5">
                          <div className="flex items-baseline gap-0.5 md:gap-1">
                            <span className="text-xs md:text-sm font-medium text-muted-foreground">USD</span>
                            <span className="text-sm md:text-xl font-bold tracking-tight">{ad.price.toLocaleString()}</span>
                          </div>
                          <span className="text-[11px] md:text-sm text-muted-foreground font-medium tracking-tight">/per-unit</span>
                        </div>
                        {ad.discountPercentage > 0 && (
                          <p className="text-[11px] md:text-sm font-medium text-green-600 mt-0.5 md:mt-1">-{ad.discountPercentage}%</p>
                        )}
                      </div>
                    </div>

                    <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed line-clamp-2">{ad.description}</p>

                    <div className="flex items-center gap-4 md:gap-6 text-[13px] md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="font-medium">1 Hours Ago</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="font-medium">20 KG</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-1.5">
                        {COLORS.map((color, i) => (
                          <Circle 
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5 md:h-4 md:w-4",
                              i === 0 && "fill-current"
                            )}
                            style={{ color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-0.5 md:pt-1">
                      <h3 className="font-medium text-[15px] md:text-base mb-2.5 md:mb-3">Overview:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 md:gap-x-6 md:gap-y-4 text-[13px] md:text-sm">
                        <div>
                          <p className="text-muted-foreground mb-0.5 md:mb-1">Form</p>
                          <p className="font-medium">Black</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5 md:mb-1">Origin</p>
                          <p className="font-medium">China</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5 md:mb-1">Form</p>
                          <p className="font-medium">Black</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5 md:mb-1">Origin</p>
                          <p className="font-medium">China</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
          </div>
          
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
        <div className="flex justify-around items-center py-2.5">
          <Button variant="ghost" className="flex flex-col items-center gap-1.5 h-auto px-3">
            <Home className="w-[22px] h-[22px] text-primary" strokeWidth={2} />
            <span className="text-[11px] font-medium text-primary">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1.5 h-auto px-3">
            <MessageSquare className="w-[22px] h-[22px] text-muted-foreground" strokeWidth={2} />
            <span className="text-[11px] font-medium text-muted-foreground">Messages</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center -mt-8 h-auto">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Plus className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-medium text-primary mt-1">Create</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1.5 h-auto px-3">
            <Heart className="w-[22px] h-[22px] text-muted-foreground" strokeWidth={2} />
            <span className="text-[11px] font-medium text-muted-foreground">Saved</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1.5 h-auto px-3">
            <UserCircle2 className="w-[22px] h-[22px] text-muted-foreground" strokeWidth={2} />
            <span className="text-[11px] font-medium text-muted-foreground">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}