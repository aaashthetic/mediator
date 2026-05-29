"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, Settings, Menu, X, Calendar, 
  User, Stethoscope, ClipboardList, Activity, 
  ShieldAlert, BadgeCheck
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { useUser } from "@clerk/nextjs"


export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null; 
  }

  const isDark = resolvedTheme === "dark"

  const role = user?.publicMetadata?.role as 'doctor' | 'patient' | undefined;
  const isVerified = user?.publicMetadata?.doctorVerified as boolean | undefined;

  let navigation: Array<{ name: string; href: string; icon: any }> = []

  if (isLoaded && user) {
    if (role === 'doctor') {
      // If the doctor is verified, grant full clinical console features
      if (isVerified) {
        navigation = [
          { name: "Dashboard", href: "/dashboard/doctor", icon: Home },
          { name: "Schedule", href: "/dashboard/doctor/schedule", icon: Calendar },
          { name: "Patient Records", href: "/dashboard/doctor/patients", icon: ClipboardList },
          { name: "Doctor Profile", href: "/dashboard/doctor/profile", icon: Stethoscope },
          { name: "Settings", href: "/settings", icon: Settings },
        ]
      } else {
        // If doctor is unverified, completely lock paths to prevent middleware loops
        navigation = [
          { name: "Verification Pending", href: "/onboarding/pending", icon: ShieldAlert },
        ]
      }
    } else if (role === 'patient') {
      navigation = [
        { name: "Dashboard", href: "/dashboard/patient", icon: Home },
        { name: "Appointments", href: "/dashboard/patient/appointments", icon: Calendar },
        { name: "Medical History", href: "/dashboard/patient/records", icon: Activity },
        { name: "Patient Profile", href: "/dashboard/patient/profile", icon: User },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    }
  }

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-all duration-300 ease-in-out lg:translate-x-0 px-3 flex flex-col h-full",
          "shadow-xl dark:shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn("flex items-center justify-center h-16 px-6")}>
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tight text-glow-primary transition-all duration-300 group-hover:opacity-80">
              MEDiator
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
                          "bg-gradient-to-b from-primary to-primary/40",
                          "shadow-md",
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
        <div className="mt-auto mb-4">
          {isLoaded && user && role && (
            <div className="px-7 flex flex-col items-center justify-center w-full text-center gap-2 animate-in fade-in duration-300">
              <div className="flex justify-center">
                {role === 'doctor' ? (
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider border shadow-sm",
                    isVerified 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  )}>
                    {isVerified ? <BadgeCheck size={11} /> : <ShieldAlert size={12} />}
                    {isVerified ? "MD Verified" : "MD Pending"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm">
                    <User size={12} />
                    Patient
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Bar Trigger */}
      <div className={cn("lg:pl-64 top-0 z-30 flex h-16 items-center gap-x-4 border-border g-backgroud/80 backdrop-blur-md px-4 sm:px-6")}>
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-x-3 sm:gap-x-5">
            {isLoaded && user && (
              <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
                <span className="text-sm font-medium text-muted-foreground hidden md:inline">
                  Hi, <span className="font-semibold text-foreground">{user.firstName || "User"}</span>
                </span>
              </div>
            )}
          <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />
          <ThemeToggle />
          <div className="flex items-center p-0.5 rounded-full border border-primary/10 shadow-md">
              <UserButton />
           </div>
          </div>
        </div>
      </div>
    </>
  )
}