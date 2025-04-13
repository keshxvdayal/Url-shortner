"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Link2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-[200px] flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4 md:h-16 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Link Analytics</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/dashboard?tab=create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Link
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Navigation</h3>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                pathname === "/dashboard" && "bg-muted",
              )}
            >
              <BarChart className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/links"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                pathname === "/dashboard/links" && "bg-muted",
              )}
            >
              <Link2 className="h-4 w-4" />
              My Links
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
