"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface CreateLinkFormProps {
  onSuccess: () => void
}

export function CreateLinkForm({ onSuccess }: CreateLinkFormProps) {
  const [originalUrl, setOriginalUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          customAlias: customAlias || undefined,
          expiresAt: expiresAt || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create link")
      }

      // Reset form
      setOriginalUrl("")
      setCustomAlias("")
      setExpiresAt(undefined)

      // Notify parent component
      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="originalUrl">Original URL</Label>
        <div className="relative">
          <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="originalUrl"
            type="url"
            placeholder="https://example.com/very-long-url"
            className="pl-10"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customAlias">Custom Alias (Optional)</Label>
        <div className="relative">
          <Input
            id="customAlias"
            placeholder="my-custom-link"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">Leave blank to generate a random short code</p>
      </div>

      <div className="space-y-2">
        <Label>Expiration Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {expiresAt ? format(expiresAt, "PPP") : "Select expiration date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={expiresAt}
              onSelect={setExpiresAt}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        {expiresAt && (
          <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={() => setExpiresAt(undefined)}>
            Clear date
          </Button>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Short Link"}
      </Button>
    </form>
  )
}
