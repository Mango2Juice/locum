// /src/components/theme-toggle.tsx

'use client'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const themeIcons: Record<string, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

/**
 * Renders a theme selection control that shows the current theme icon and lets the user switch themes via a dropdown.
 *
 * During initial hydration, renders a disabled placeholder button to prevent layout shift and avoid hydration errors.
 *
 * @returns The theme toggle as a React element
 */
export function ThemeToggle(): React.ReactElement {
  const { theme, themes, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  const CurrentIcon = (theme && themeIcons[theme]) || Monitor
  const uniqueThemes = Array.from(new Set(themes ?? []))

  if (!mounted) {
    // Render a placeholder button to prevent layout shift during hydration and avoid hydration error.
    return (
      <Button variant='ghost' size='icon' disabled={true}>
        <Monitor className='h-[1.2rem] w-[1.2rem]' />
        <span className='sr-only'>Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant='ghost' size='icon' aria-label={`Toggle theme (current: ${theme})`}>
          <CurrentIcon className='h-[1.2rem] w-[1.2rem]' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {uniqueThemes.map((t) => {
          const Icon = themeIcons[t] || null
          return (
            <DropdownMenuItem key={t} onClick={() => handleThemeChange(t)} className='capitalize'>
              {Icon && <Icon className='mr-2 w-4 h-4' />}
              {t}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
