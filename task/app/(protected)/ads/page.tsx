"use client"
import { useState } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { redirect } from "next/navigation"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardHeader } from "@/components/shadcn/card"
import { useAds } from "@/lib/hooks/useAds"
import { ProductCardSkeleton } from "@/components/ads/product-card-skeleton"
import Image from "next/image"
import Link from "next/link"

const ITEMS_PER_PAGE = 9

export default function AdsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { isAuthenticated, logout } = useAuthStore()
  const { data, isLoading, error } = useAds(currentPage, ITEMS_PER_PAGE)

  if (!isAuthenticated) {
    redirect("/login")
  }

  if (error) {
    return <div className="min-h-screen p-8">Error loading ads</div>
  }

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Products</h1>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
            Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) :
          (data?.products.map((ad) => (
            <Card key={ad.id}>
              <div className="relative w-full h-48">
                <Image
                  src={ad.thumbnail}
                  alt={ad.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardHeader className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{ad.title}</h2>
                    <p className="text-sm text-muted-foreground">{ad.brand}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">${ad.price}</span>
                    {ad.discountPercentage > 0 && (
                      <p className="text-sm text-green-600">-{ad.discountPercentage}%</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                    {ad.category}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Rating: {ad.rating?.toFixed(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{ad.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Stock: {ad.stock}
                  </span>
                  <Link href={`/ads/${ad.id}`}>
                    <Button variant="secondary" className="cursor-pointer" size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </div>
        {!isLoading && (
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
  )
}