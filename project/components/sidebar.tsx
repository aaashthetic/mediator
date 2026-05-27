"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderOpen, Users, Settings, Menu, X, BarChart3, Calendar, Bell, Search } from "lucide-react"
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"


const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Team", href: "/team", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null; 
  }

  const isDark = resolvedTheme === "dark"

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-all duration-300 ease-in-out lg:translate-x-0 px-3",
          "shadow-[4px_0_24px_-12px_rgba(168,85,247,0.2)]",
          "dark:shadow-[4px_0_24px_-12px_rgba(168,85,247,0.3)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn("flex items-center justify-center h-16 px-6")}>
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tight text-glow-primary transition-all duration-300 group-hover:opacity-80">
              Balangkas
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link href={item.href} className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive ? "text-primary font-bold" : "text-foreground hover:bg-primary/5 hover:text-primary"}`}>
                    <item.icon 
                      className={cn(
                        "mr-3 transition-transform group-hover:scale-110",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} 
                      size={18} 
                    />
                    {item.name}
                    {isActive && (
                      <div 
                        className={cn(
                          "absolute left-0 w-[4px] h-8 rounded-r-full",
                          "bg-gradient-to-b from-primary via-primary to-primary/40",
                          "shadow-[2px_0_15px_rgba(168,85,247,0.6)]",
                          "animate-in fade-in slide-in-from-left-2 duration-500"
                        )} 
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Top Bar Trigger */}
      <div className={cn("lg:pl-64 top-0 z-30 flex h-16 items-center gap-x-4 border-border g-backgroud/80 backdrop-blur-md px-4 sm:px-6")}>
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-x-3 sm:gap-x-5">
            {mounted ? (
              <OrganizationSwitcher 
                hidePersonal={true}
              />
            ) : (
              <div className="h-9 w-32 bg-muted animate-pulse rounded-lg" />
            )}
          <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />
          <ThemeToggle />
          <div className="flex items-center p-0.5 rounded-full border border-primary/10 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              <UserButton />
           </div>
          </div>
        </div>
      </div>
    </>
  )
}