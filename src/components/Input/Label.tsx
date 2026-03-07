import { forwardRef } from 'react'

interface InputContainerProps {
  name: string
  label: string
}

const InputContainer = forwardRef<HTMLLabelElement, InputContainerProps>(
  ({ name, label, ...rest }, ref) => {
    return (
      <label
        className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300"
        htmlFor={name}
        ref={ref}
        {...rest}
      >
        {label}
      </label>
    )
  },
)

InputContainer.displayName = 'InputContainer'

export default InputContainer
