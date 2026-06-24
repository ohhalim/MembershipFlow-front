import { cn } from '@/lib/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'red' | 'gray' | 'green'
  className?: string
}

export function Badge({ children, variant = 'blue', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded',
        {
          'bg-blue-100 text-blue-700': variant === 'blue',
          'bg-red-100 text-red-600': variant === 'red',
          'bg-gray-100 text-gray-600': variant === 'gray',
          'bg-green-100 text-green-700': variant === 'green',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
