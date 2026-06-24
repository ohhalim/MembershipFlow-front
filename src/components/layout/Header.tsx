import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface HeaderProps {
  title: string
  right?: ReactNode
  className?: string
}

export function Header({ title, right, className }: HeaderProps) {
  return (
    <header className={cn('flex items-center justify-between px-4 pt-12 pb-3', className)}>
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {right && <div>{right}</div>}
    </header>
  )
}
