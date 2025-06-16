import { Leaf } from "lucide-react"
import { LoginForm } from "../../components/login-form"
import { AuthAside } from "../../components/auth-aside"
import Link from "next/link"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams
  
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-900 text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-bold">Rooted Platform</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {message && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 font-medium">{message}</p>
              </div>
            )}
            <LoginForm />
          </div>
        </div>
      </div>
      {/* Auth marketing side panel */}
      <AuthAside />
    </div>
  )
} 