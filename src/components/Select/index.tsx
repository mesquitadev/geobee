import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { ChevronDown } from 'lucide-react'

// Atualizando a interface para aceitar string ou boolean como valor
type Option = {
  value: string | boolean
  label: string
}

interface InputProps<T extends FieldValues = FieldValues> {
  control: Control<T>
  name: Path<T>
  type?: string
  className?: string
  placeholder?: string
  label?: string
  helpText?: string
  errors: any
  options: Option[]
}

// Definindo o tipo para o componente forwardRef com displayName
interface SelectComponentType {
  <T extends FieldValues>(
    props: InputProps<T> & { ref?: React.ForwardedRef<unknown> },
  ): React.ReactElement
  displayName?: string
}

const Select = forwardRef(
  <T extends FieldValues>(
    {
      control,
      name,
      type = 'text',
      placeholder = 'Selecione uma opção...',
      errors,
      className,
      label,
      helpText,
      options,
      ...rest
    }: InputProps<T>,
    ref: any,
  ) => {
    const inputElementRef = useRef<HTMLSelectElement | null>(null)

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputElementRef.current?.focus()
      },
    }))

    const hasError = !!errors
    const selectClasses = `w-full appearance-none rounded-lg border px-4 py-3 pr-10 text-base transition-colors duration-200 ease-in-out
      ${
        hasError
          ? 'border-red-400 bg-red-50 text-red-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500 dark:bg-red-900/10 dark:text-red-100'
          : 'border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20'
      } shadow-sm outline-none sm:text-sm ${className || ''}`

    return (
      <Controller
        control={control}
        name={name}
        defaultValue={'' as any}
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
              <select
                className={selectClasses}
                id={name}
                ref={inputElementRef}
                {...rest}
                {...field}
                value={field.value || ''}
              >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                  <option
                    key={String(option.value)}
                    value={String(option.value)}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
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
) as SelectComponentType

// Agora podemos atribuir displayName sem erros
Select.displayName = 'Select'

export default Select
