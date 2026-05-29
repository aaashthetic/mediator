import { cn } from '@/lib/utils'
import Image from 'next/image'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("relative flex items-center", className)}>
            <Image 
                src='/images/mediator-logo.png'
                alt="MEDiator Logo and Title"
                width={500}
                height={200}
                className={cn('h-8 w-auto object-contain', className)}
            />
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn("relative flex items-center", className)}>
            <Image 
                src="/images/mediator-logo.png"
                alt="MEDiator Logo Icon"
                width={500}
                height={200}
                className={cn('h-8 w-auto object-contain', className)}
            />
        </div>
    )
}