import { cn } from '@/lib/utils'
import Image from 'next/image'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("relative flex items-center", className)}>
            <Image 
                src='/images/simula-logo-title.png'
                alt="SIMULA Logo and Title"
                width={200}
                height={50}
                className={cn('h-8 w-auto object-contain', className)}
            />
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn("relative flex items-center", className)}>
            <Image 
                src="/images/simula-logo.png"
                alt="SIMULA Logo Icon"
                width={200}
                height={50}
                className={cn('h-8 w-auto object-contain', className)}
            />
        </div>
    )
}