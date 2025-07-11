import React, { forwardRef } from 'react'
import { tw } from '../../utils/tw'

interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  required?: boolean
}

interface ContainerProps {
  children: React.ReactNode
}

// Componente Input básico
const SimpleInput = forwardRef<HTMLInputElement, SimpleInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={tw(
          'w-full rounded-lg border border-gray-300 dark:border-zinc-600',
          'bg-white text-gray-900 dark:bg-zinc-800 dark:text-zinc-100',
          'px-4 py-3 text-base transition-colors duration-200 ease-in-out',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)

SimpleInput.displayName = 'SimpleInput'

// Componente Label
const Label = ({ children, required, className, ...props }: LabelProps) => {
  return (
    <label
      className={tw(
        'mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  )
}

// Componente Container
const Container = ({ children }: ContainerProps) => {
  return <div className="space-y-1">{children}</div>
}

// Exportar como objeto composto
const Input = Object.assign(SimpleInput, {
  Label,
  Container,
})

export default Input
