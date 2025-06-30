import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

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
      placeholder,
      errors,
      className,
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

    const getError = (message: string) => {
      return <p className="text-xs italic text-red-500">{message}</p>
    }

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            <div className="relative">
              <select className={className} id={name} {...rest} {...field}>
                <option>Selecione uma opção...</option>
                {options.map((option) => (
                  <option
                    key={String(option.value)}
                    value={String(option.value)}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {getError(errors)}
          </>
        )}
      />
    )
  },
) as SelectComponentType

// Agora podemos atribuir displayName sem erros
Select.displayName = 'Select'

export default Select
