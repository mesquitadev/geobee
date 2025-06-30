import React, { forwardRef, useRef, useImperativeHandle } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

interface InputProps<T extends FieldValues = FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  type?: string
  className?: string
  placeholder?: string
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

    const getError = (message: string) => {
      return <p className="text-xs italic text-red-500">{message}</p>
    }

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            <input
              {...field}
              ref={inputElementRef}
              className={className}
              id={name}
              type={type}
              placeholder={placeholder}
              {...rest}
            />
            {getError(errors)}
          </>
        )}
      />
    )
  },
) as InputComponentType

// Agora podemos atribuir displayName sem erros
Input.displayName = 'Input'

export default Input
