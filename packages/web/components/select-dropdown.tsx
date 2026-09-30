import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormControl } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SelectDropdownItem {
  label: React.ReactNode
  value: string
  disabled?: boolean
}

export interface SelectDropdownProps {
  /** Controlled value */
  value?: string
  /** Uncontrolled default value */
  defaultValue?: string
  /** Callback fired when selection changes */
  onValueChange?: (value: string) => void
  /** List of selectable items */
  items?: SelectDropdownItem[]
  /** Placeholder text shown when no value is selected */
  placeholder?: string
  /** Whether the dropdown is disabled */
  disabled?: boolean
  /** Shows a loading spinner inside the dropdown */
  isPending?: boolean
  /** Custom text to show during loading */
  loadingText?: string
  /** Custom text to show when items list is empty */
  emptyText?: string
  /** Additional classes for the trigger button */
  className?: string
  /** Additional classes for the dropdown content popup */
  contentClassName?: string
  /** Flag for backward compatibility with older controlled usages */
  isControlled?: boolean
  /** Whether to wrap the trigger in Shadcn FormControl (when inside a FormItem) */
  inFormField?: boolean
}

export function SelectDropdown({
  value,
  defaultValue,
  onValueChange,
  items,
  placeholder = 'Select an option',
  disabled = false,
  isPending = false,
  loadingText = 'Loading...',
  emptyText = 'No options available',
  className,
  contentClassName,
  isControlled = false,
  inFormField = false,
}: SelectDropdownProps) {
  // Support standard React controlled pattern (value provided) and legacy isControlled flag
  const isControlledMode = isControlled || value !== undefined
  const selectState = isControlledMode
    ? { value: value ?? defaultValue ?? '', onValueChange }
    : { defaultValue, onValueChange }

  const trigger = (
    <SelectTrigger
      disabled={disabled || isPending}
      className={cn('w-full justify-between', className)}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  )

  return (
    <Select {...selectState}>
      {inFormField ? <FormControl>{trigger}</FormControl> : trigger}
      <SelectContent className={cn('min-w-[8rem]', contentClassName)}>
        {isPending ? (
          <div className='flex items-center justify-center gap-2 py-4 px-2 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
            <span>{loadingText}</span>
          </div>
        ) : items && items.length > 0 ? (
          items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              {item.label}
            </SelectItem>
          ))
        ) : (
          <div className='py-4 text-center text-xs text-muted-foreground'>
            {emptyText}
          </div>
        )}
      </SelectContent>
    </Select>
  )
}
