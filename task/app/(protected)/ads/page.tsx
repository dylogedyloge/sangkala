"use client"
import { useAuthStore } from "@/lib/store/auth-store"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface Ad {
  id: string
  title: string
  description: string
  price: number
  location: string
  postedAt: string
}

const mockAds: Ad[] = [
  {
    id: "1",
    title: "Modern Apartment in City Center",
    description: "Beautiful 2-bedroom apartment with modern amenities",
    price: 1500,
    location: "Downtown",
    postedAt: "2024-02-15"
  },
  {
    id: "2",
    title: "Office Space for Rent",
    description: "Professional office space with parking",
    price: 2000,
    location: "Business District",
    postedAt: "2024-02-14"
  },
  {
    id: "3",
    title: "Cozy Studio Apartment",
    description: "Fully furnished studio with utilities included",
    price: 800,
    location: "University Area",
    postedAt: "2024-02-13"
  }
]

export default function AdsPage() {
  const { isAuthenticated, logout } = useAuthStore()

  if (!isAuthenticated) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Ads</h1>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockAds.map((ad) => (
            <Card key={ad.id}>
              <CardHeader className="space-y-1">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{ad.title}</h2>
                  <span className="text-lg font-bold">${ad.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{ad.location}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{ad.description}</p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Posted on {ad.postedAt}</span>
                  <Button variant="secondary" size="sm">Contact</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}