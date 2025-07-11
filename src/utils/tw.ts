import { twMerge } from 'tailwind-merge'

export function tw(...classes: (string | undefined | false | null)[]) {
  return twMerge(classes.filter(Boolean).join(' '))
}
