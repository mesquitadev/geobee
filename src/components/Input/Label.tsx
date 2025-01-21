import { forwardRef } from 'react'

interface InputContainerProps {
  name: string
  label: string
}

const InputContainer = forwardRef<HTMLLabelElement, InputContainerProps>(
  ({ name, label, ...rest }, ref) => {
    return (
      <label
        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
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
