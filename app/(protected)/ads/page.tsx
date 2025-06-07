"use client"
import { useState, useEffect, useRef, useCallback } from "react"
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
import { ArrowUpDown, Bell, ChevronDown, Menu, Plus, Heart, UserCircle2, LayoutList, LayoutGrid, Search, X } from "lucide-react"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn/pagination"
import Link from "next/link"

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

export default function AdsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || ALL_CATEGORIES)
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || ALL_BRANDS)
  const [onlyInStock, setOnlyInStock] = useState(searchParams.get("inStock") === "true")
  const [priceSort, setPriceSort] = useState<SortOrder>(
    (searchParams.get("sort") as SortOrder) || "default"
  )
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [isMobile, setIsMobile] = useState(false)
  const loadingRef = useRef(null)

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

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    if (selectedCategory && selectedCategory !== ALL_CATEGORIES) {
      params.set("category", selectedCategory)
    } else {
      params.delete("category")
    }
    if (selectedBrand && selectedBrand !== ALL_BRANDS) {
      params.set("brand", selectedBrand)
    } else {
      params.delete("brand")
    }
    if (onlyInStock) {
      params.set("inStock", "true")
    } else {
      params.delete("inStock")
    }
    if (priceSort !== "default") {
      params.set("sort", priceSort)
    } else {
      params.delete("sort")
    }
    router.replace(`/ads?${params.toString()}`)
  }, [searchQuery, selectedCategory, selectedBrand, onlyInStock, priceSort, router, searchParams])

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is our md breakpoint
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!isMobile || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setCurrentPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [isMobile, isLoading, currentPage, totalPages])

  // Modify products state to accumulate items for mobile view
  const [accumulatedProducts, setAccumulatedProducts] = useState<Product[]>([])

  useEffect(() => {
    if (isMobile) {
      if (data?.products) {
        setAccumulatedProducts(prev => 
          currentPage === 1 
            ? data.products 
            : [...prev, ...data.products]
        )
      }
    } else {
      // Reset accumulated products when switching to desktop
      setAccumulatedProducts([])
    }
  }, [data?.products, currentPage, isMobile])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
    setAccumulatedProducts([])
  }, [searchQuery, selectedCategory, selectedBrand, onlyInStock, priceSort])

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
                    className="w-full pl-10 pr-3 py-2 bg-muted/50 rounded-full"
                  />
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
              className="w-full pl-9 pr-3 py-2 rounded-full bg-muted/50 border-0 text-[13px]"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            <div className="ml-auto flex items-center  border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 rounded-none",
                  viewMode === "list" && "bg-muted"
                )}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 rounded-none",
                  viewMode === "grid" && "bg-muted"
                )}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Cards */}
          <div className={cn(
            "space-y-4 px-4 md:px-0",
            viewMode === "grid" && "md:space-y-0 md:grid md:grid-cols-3 md:gap-4"
          )}>
            {isLoading && currentPage === 1 ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : (
              <>
                {/* Show accumulated products for mobile, regular data.products for desktop */}
                {(isMobile ? accumulatedProducts : data?.products)?.map((ad: Product) => (
                  <Link 
                    key={ad.id} 
                    href={`/ads/${ad.id}`}
                    className="block transition-transform active:scale-[0.98]"
                  >
                    <Card className="overflow-hidden hover:border-primary/50">
                      <div className={cn(
                        "flex flex-col",
                        viewMode === "list" && "md:flex-row md:gap-8"
                      )}>
                        <div className={cn(
                          "relative w-full h-[180px] flex-shrink-0",
                          viewMode === "list" ? "md:w-[300px] md:h-[240px]" : "md:h-[200px]"
                        )}>
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
                        <div className={cn(
                          "flex-1 p-4",
                          viewMode === "list" ? "md:p-6 md:pr-8" : "md:p-4",
                          "space-y-4 md:space-y-5"
                        )}>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h2 className={cn(
                                "text-lg font-semibold tracking-tight mb-1.5",
                                viewMode === "list" ? "md:text-xl md:mb-2" : "md:text-lg md:mb-1.5"
                              )}>{ad.title}</h2>
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
                                  <span className={cn(
                                    "text-sm font-bold tracking-tight",
                                    viewMode === "list" ? "md:text-xl" : "md:text-lg"
                                  )}>{ad.price.toLocaleString()}</span>
                                </div>
                                <span className="text-[11px] md:text-sm text-muted-foreground font-medium tracking-tight">/per-unit</span>
                              </div>
                              {ad.discountPercentage > 0 && (
                                <p className="text-[11px] md:text-sm font-medium text-green-600 mt-0.5 md:mt-1">-{ad.discountPercentage}%</p>
                              )}
                            </div>
                          </div>

                          <p className={cn(
                            "text-[13px] md:text-sm text-muted-foreground leading-relaxed line-clamp-2",
                            viewMode === "grid" && "md:line-clamp-3"
                          )}>{ad.description}</p>

                          {viewMode === "list" && (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}

                {/* Loading indicator for mobile lazy loading */}
                {isMobile && currentPage < totalPages && (
                  <div ref={loadingRef} className="py-4 flex justify-center">
                    <ProductCardSkeleton />
                  </div>
                )}
              </>
            )}
          </div>
          
          {!isMobile && !isLoading && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(p => Math.max(1, p - 1))
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {/* First Page */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(1)
                      }}
                      isActive={currentPage === 1}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {/* Show ellipsis if there are hidden pages before current page */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Page before current */}
                  {currentPage > 2 && currentPage !== totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(currentPage - 1)
                        }}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Current page (if not first or last) */}
                  {currentPage !== 1 && currentPage !== totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(currentPage)
                        }}
                        isActive
                      >
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Page after current */}
                  {currentPage < totalPages - 1 && currentPage !== 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(currentPage + 1)
                        }}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Show ellipsis if there are hidden pages after current page */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Last Page */}
                  {totalPages > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(totalPages)
                        }}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(p => Math.min(totalPages, p + 1))
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
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

      {/* Desktop Footer */}
      <div className="hidden md:block border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-8">
            {/* Useful Links */}
            <div>
              <h3 className="font-semibold mb-4">Useful Links</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[70px] h-[55px] bg-muted rounded"></div>
                <div className="w-[70px] h-[55px] bg-muted rounded"></div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
              </div>
            </div>

            {/* Documentation */}
            <div>
              <h3 className="font-semibold mb-4">Documentation</h3>
              <div className="space-y-2 text-sm">
                <p className="text-primary">https://docs.example.com</p>
                <p className="text-muted-foreground">Comprehensive guides and resources</p>
                <p className="text-muted-foreground">Access for all users</p>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm">
                <p className="text-primary">https://support.example.com</p>
                <p className="text-muted-foreground">Get help from our support team</p>
                <p className="text-muted-foreground">Available 24/7</p>
              </div>
            </div>

            {/* Community Forum */}
            <div>
              <h3 className="font-semibold mb-4">Community Forum</h3>
              <div className="space-y-2 text-sm">
                <p className="text-primary">https://forum.example.com</p>
                <p className="text-muted-foreground">Join discussions with other users</p>
                <p className="text-muted-foreground">Share tips and tricks</p>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">@ by Me</p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground mr-2">Follow Us</p>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}