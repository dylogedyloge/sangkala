"use client"
import { use } from "react"
import { useAd } from "@/lib/hooks/useAds"
import { useAuthStore } from "@/lib/store/auth-store"
import { redirect } from "next/navigation"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardHeader } from "@/components/shadcn/card"
import { Skeleton } from "@/components/shadcn/skeleton"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { Star, ArrowLeft, Box, Truck, Shield } from "lucide-react"


export default function AdDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isAuthenticated } = useAuthStore()
  const { data: ad, isLoading, error } = useAd(id)

  if (!isAuthenticated) {
    redirect("/login")
  }

  if (error) {
    return <div className="min-h-screen p-8">Error loading product details</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/ads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        {ad && (
          <Card>
            <CardHeader>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative aspect-square">
                  <Image
                    src={ad?.thumbnail || ''}
                    alt={ad?.title || ''}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold">{ad?.title}</h1>
                    <p className="text-muted-foreground">{ad?.brand}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(ad?.rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({ad?.rating.toFixed(1)})
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-bold">${ad?.price}</span>
                    {(ad?.discountPercentage || 0) > 0 && (
                      <span className="ml-2 text-green-600">
                        -{ad?.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 pt-4">
                    <div className="flex items-center gap-2">
                      <Box className="text-blue-500" />
                      <span>SKU: {ad?.sku}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="text-blue-500" />
                      <span>{ad?.shippingInformation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="text-blue-500" />
                      <span>{ad?.warrantyInformation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground">{ad?.description}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Specifications</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Weight:</span> {ad?.weight}g
                    </p>
                    <p>
                      <span className="font-medium">Category:</span> {ad?.category}
                    </p>
                    <p>
                      <span className="font-medium">Stock:</span> {ad?.stock} units
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Dimensions:</span>
                    </p>
                    <p className="pl-4">Width: {ad?.dimensions.width}cm</p>
                    <p className="pl-4">Height: {ad?.dimensions.height}cm</p>
                    <p className="pl-4">Depth: {ad?.dimensions.depth}cm</p>
                  </div>
                </div>
              </div>

              {ad?.reviews && ad.reviews.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                  <div className="space-y-4">
                    {ad.reviews.map((review, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{review.reviewerName}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(review.date), "MMM d, yyyy")}
                            </span>
                          </div>
                          <p className="mt-2">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}