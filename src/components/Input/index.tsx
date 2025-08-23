import React, { forwardRef, useRef, useImperativeHandle } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

interface InputProps<T extends FieldValues = FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  type?: string
  className?: string
  placeholder?: string
  label?: string
  helpText?: string
  errors: any
}

interface InputComponentType {
  <T extends FieldValues>(
    props: InputProps<T> & { ref?: React.ForwardedRef<unknown> },
  ): React.ReactElement
  displayName?: string
}

const Input = forwardRef(
  <T extends FieldValues>(
    {
      control,
      name,
      type = 'text',
      placeholder,
      errors,
      className,
      label,
      helpText,
      ...rest
    }: InputProps<T>,
    ref: any,
  ) => {
    const inputElementRef = useRef<HTMLInputElement | null>(null)

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputElementRef.current?.focus()
      },
    }))

    const hasError = !!errors
    const inputClasses = `w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 ease-in-out
      ${
        hasError
          ? 'border-red-400 bg-red-50 text-red-800 placeholder-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500 dark:bg-red-900/10 dark:text-red-100 dark:placeholder-red-300'
          : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20'
      } shadow-sm outline-none sm:text-sm ${className || ''}`

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="w-full">
            {label && (
              <label
                htmlFor={name}
                className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                {label}
              </label>
            )}
            <div className="relative">
              <input
                {...field}
                ref={inputElementRef}
                className={inputClasses}
                id={name}
                type={type}
                placeholder={placeholder}
                autoComplete={
                  type === 'password'
                    ? 'current-password'
                    : type === 'email'
                    ? 'email'
                    : 'off'
                }
                {...rest}
              />
            </div>
            {hasError && (
              <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                {errors}
              </p>
            )}
            {helpText && !hasError && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {helpText}
              </p>
            )}
          </div>
        )}
      />
    )
  },
) as InputComponentType

// Agora podemos atribuir displayName sem erros
Input.displayName = 'Input'

export default Input
