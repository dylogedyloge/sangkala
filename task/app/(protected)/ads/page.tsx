"use client"
import { useAuthStore } from "@/lib/store/auth-store"
import { redirect } from "next/navigation"
import { Button } from "@/components/shadcn/button"
import { Card, CardContent, CardHeader } from "@/components/shadcn/card"
import { useAds } from "@/lib/hooks/useAds"
import Image from "next/image"

export default function AdsPage() {
  const { isAuthenticated, logout } = useAuthStore()
  const { data: ads, isLoading, error } = useAds()

  if (!isAuthenticated) {
    redirect("/login")
  }

  if (isLoading) {
    return <div className="min-h-screen p-8">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen p-8">Error loading ads</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Products</h1>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ads?.map((ad) => (
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
                  <Button variant="secondary" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}