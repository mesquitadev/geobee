import { tv, VariantProps } from 'tailwind-variants'
import { Slot } from '@radix-ui/react-slot'
import { ButtonHTMLAttributes } from 'react'

const button = tv({
  base: [
    'rounded-lg px-4 py-2 text-sm font-medium outline-none transition-all duration-200',
    'focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none',
  ],
  variants: {
    variant: {
      primary: [
        'bg-indigo-600 text-white shadow-sm',
        'hover:bg-indigo-700',
        'active:bg-indigo-800',
        'focus-visible:ring-indigo-500',
        'dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:active:bg-indigo-700',
      ],
      secondary: [
        'bg-gray-100 text-gray-800 shadow-sm',
        'hover:bg-gray-200 hover:text-gray-900',
        'active:bg-gray-300',
        'focus-visible:ring-gray-500',
        'dark:bg-zinc-700 dark:text-zinc-100',
        'dark:hover:bg-zinc-600 dark:active:bg-zinc-800',
      ],
      outline: [
        'border border-gray-300 bg-transparent text-gray-700 shadow-sm',
        'hover:border-indigo-500 hover:text-indigo-600',
        'active:bg-gray-50',
        'focus-visible:ring-indigo-500',
        'dark:border-zinc-600 dark:text-zinc-300',
        'dark:hover:border-indigo-400 dark:hover:text-indigo-300',
        'dark:active:bg-zinc-800',
      ],
      ghost: [
        'bg-transparent text-gray-700 shadow-none',
        'hover:bg-gray-100 hover:text-gray-900',
        'active:bg-gray-200',
        'focus-visible:ring-gray-500',
        'dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:active:bg-zinc-700',
      ],
      danger: [
        'bg-red-600 text-white shadow-sm',
        'hover:bg-red-700',
        'active:bg-red-800',
        'focus-visible:ring-red-500',
        'dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700',
      ],
      success: [
        'bg-green-600 text-white shadow-sm',
        'hover:bg-green-700',
        'active:bg-green-800',
        'focus-visible:ring-green-500',
        'dark:bg-green-500 dark:hover:bg-green-600 dark:active:bg-green-700',
      ],
    },
    size: {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
      xl: 'px-6 py-3 text-lg',
    },
    fullWidth: {
      true: 'w-full',
    },
    rounded: {
      true: 'rounded-full',
      false: 'rounded-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    rounded: false,
    fullWidth: false,
  },
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean
}

export function Button({
  asChild,
  variant,
  size,
  rounded,
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      {...props}
      className={button({ variant, size, rounded, fullWidth, className })}
    />
  )
}
