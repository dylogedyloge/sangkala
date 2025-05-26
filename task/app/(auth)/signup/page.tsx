"use client"
import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form"
import { AuthCard } from "@/components/ui/auth-card"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthCard
        header={
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">Enter your details to get started</p>
          </div>
        }
      >
        <SignupForm />
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </AuthCard>
    </div>
  )
}