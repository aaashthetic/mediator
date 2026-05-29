'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Menu, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export const HeroHeader = () => {
    const pathname = usePathname()
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <nav data-state={menuState && 'active'} className="fixed z-50 w-full px-2">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex items-center justify-between py-3 lg:py-4">
                        <div className="flex items-center">
                            <Link href="/" aria-label="home" className="flex items-center space-x-2">
                                <Logo />
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {!mounted ? (
                                <div className="h-8 w-8 rounded-full bg-zinc-100 animate-pulse" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Show when="signed-in">
                                        <UserButton fallbackRedirectUrl="/" />
                                    </Show>

                                    <Show when="signed-out">
                                        <SignInButton mode="modal">
                                            <Button variant="ghost" size="sm" className="rounded-full hidden md:inline-flex">
                                                Login
                                            </Button>
                                        </SignInButton>
                                        <SignUpButton mode="modal">
                                            <Button size="sm" className="rounded-full">
                                                Get Started
                                            </Button>
                                        </SignUpButton>
                                    </Show>
                                </div>
                            )}
                            <button
                                onClick={() => setMenuState(!menuState)}
                                className="relative z-20 block p-2 lg:hidden">
                                {menuState ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}