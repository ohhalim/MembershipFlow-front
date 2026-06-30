import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface HeaderProps {
  title: string
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export function Header({ title, left, right, className }: HeaderProps) {
  return (
    <header className={cn('flex items-center justify-between px-4 pt-12 pb-3 lg:pt-6', className)}>
      <div className="flex items-center gap-1">
        {left && <div>{left}</div>}
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      {right && <div>{right}</div>}
    </header>
  )
}
