"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"

export default function RedirectPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const resolvedParams = use(params)
  const shortCode = resolvedParams.shortCode

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      try {
        const response = await fetch(`/api/redirect/${shortCode}`, {
          method: "GET",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Link not found or has expired")
        }

        const data = await response.json()
        window.location.href = data.originalUrl
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      }
    }

    redirectToOriginalUrl()
  }, [shortCode])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Redirecting you to the destination...</p>
        </div>
      )}
    </div>
  )
}
