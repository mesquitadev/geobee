import { forwardRef } from 'react'

interface InputContainerProps {
  name: string
  label: string
}

const LabelContainer = ({ name, label, ...rest }: InputContainerProps) => {
  return (
    <label
      className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700"
      htmlFor={name}
      {...rest}
    >
      {label}
    </label>
  )
}

export default forwardRef(LabelContainer)
