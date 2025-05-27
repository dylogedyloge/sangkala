import { Card, CardContent, CardHeader } from "@/components/shadcn/card"
import { cn } from "@/lib/utils"

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  header?: React.ReactNode
}

export function AuthCard({ children, header, className, ...props }: AuthCardProps) {
  return (
    <Card className={cn("w-full max-w-md", className)} {...props}>
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  )
}