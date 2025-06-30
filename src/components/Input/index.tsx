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
    const inputClasses = `w-full rounded-md border px-3.5 py-2.5 text-gray-900 shadow-sm focus:ring-2 focus:ring-inset focus:outline-none 
      ${
        hasError
          ? 'border-red-300 placeholder-red-300 focus:ring-red-500 dark:border-red-600 dark:text-red-100'
          : 'border-gray-300 placeholder-gray-400 focus:ring-indigo-600 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100'
      } text-base sm:text-sm ${className || ''}`

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="w-full">
            {label && (
              <label
                htmlFor={name}
                className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-200"
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors}
              </p>
            )}
            {helpText && !hasError && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
