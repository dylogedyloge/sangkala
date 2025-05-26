"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError("")
    setIsLoading(true)
    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const success = login(values.email, values.password)
      
      if (success) {
        router.push("/ads")
      } else {
        setError("Invalid email or password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="text-sm text-red-500 text-center">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          {...form.register("email")}
          id="email"
          type="email"
          placeholder="Enter your email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          {...form.register("password")}
          id="password"
          type="password"
          placeholder="Enter your password"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Login"}
      </Button>
    </form>
  )
}