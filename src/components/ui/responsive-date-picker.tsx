// src/components/ui/responsive-date-picker.tsx
'use client'

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDevice } from '@/hooks/use-device'
import { cn } from '@/lib/utils'

interface ResponsiveDatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  triggerId: string
  disabled?: ((date: Date) => boolean) | boolean
  fromYear?: number
  toYear?: number
  'aria-label'?: string
}

export function ResponsiveDatePicker({
  date,
  onSelect,
  triggerId,
  disabled,
  fromYear,
  toYear,
  ...props
}: Readonly<ResponsiveDatePickerProps>) {
  const { isMobile } = useDevice()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate)
    setIsOpen(false)
  }

  // Map fromYear/toYear numeric props to DayPicker's fromMonth/toMonth Date props
  const fromMonth = typeof fromYear === 'number' ? new Date(fromYear, 0, 1) : undefined
  const toMonth = typeof toYear === 'number' ? new Date(toYear, 11, 31) : undefined

  const triggerButton = (
    <Button
      id={triggerId}
      variant='outline'
      className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
      disabled={typeof disabled === 'boolean' ? disabled : false}
      aria-label={props['aria-label']}
    >
      <CalendarIcon className='mr-2 h-4 w-4' />
      {date ? format(date, 'PPP') : <span>Pick a date</span>}
    </Button>
  )

  const calendarComponent = (
    <Calendar
      mode='single'
      selected={date}
      onSelect={handleSelect}
      disabled={disabled}
      captionLayout='dropdown'
      autoFocus
      // Ensure we pass both month-range and explicit numeric year bounds so DayPicker
      // respects the requested range regardless of internal prop handling.
      {...(fromMonth ? { fromMonth } : {})}
      {...(toMonth ? { toMonth } : {})}
      {...(typeof fromYear === 'number' ? { fromYear } : {})}
      {...(typeof toYear === 'number' ? { toYear } : {})}
      // Also pass startMonth/endMonth aliases to be explicit about nav bounds
      {...(fromMonth ? { startMonth: fromMonth } : {})}
      {...(toMonth ? { endMonth: toMonth } : {})}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select a date</DrawerTitle>
          </DrawerHeader>
          {calendarComponent}
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        {calendarComponent}
      </PopoverContent>
    </Popover>
  )
}
