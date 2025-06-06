"use client"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { AuthCard } from "@/components/ui/auth-card"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthCard
        header={
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">Login to your account</p>
          </div>
        }
      >
        <LoginForm />
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </AuthCard>
    </div>
  )
}