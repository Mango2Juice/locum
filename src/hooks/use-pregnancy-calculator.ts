'use client'

import { useEffect, useState } from 'react'
import {
  calculatePregnancyFromEdd,
  calculatePregnancyInfo,
  type PregnancyInfo,
} from '@/lib/utils/pregnancy-calculator'

export type CalculationMethod = 'lmp' | 'ultrasound' | 'reverseUltrasound'

/**
 * Manages pregnancy-related input state and provides a computed PregnancyInfo plus a reset handler.
 *
 * Supports three calculation methods:
 * - `lmp`: Calculate from Last Menstrual Period only
 * - `ultrasound`: Calculate from LMP with ultrasound date and GA at scan
 * - `reverseUltrasound`: Calculate from a known EDD (reverse calculation)
 *
 * Recomputes `pregnancyInfo` whenever relevant inputs change. The reset handler restores initial defaults.
 *
 * @returns An object containing:
 * - `method`: the current calculation method
 * - `setMethod`: setter for the calculation method
 * - `lmpDate`: the last menstrual period date or `undefined`
 * - `setLmpDate`: setter for `lmpDate`
 * - `ultrasoundDate`: the ultrasound date or `undefined`
 * - `setUltrasoundDate`: setter for `ultrasoundDate`
 * - `gaWeeks`: gestational age weeks as a string
 * - `setGaWeeks`: setter for `gaWeeks`
 * - `gaDays`: gestational age days as a string
 * - `setGaDays`: setter for `gaDays`
 * - `eddDate`: the known EDD date or `undefined` (for reverse ultrasound method)
 * - `setEddDate`: setter for `eddDate`
 * - `pregnancyInfo`: the computed `PregnancyInfo` or `null`
 * - `handleReset`: function that resets inputs to their initial defaults
 */
export function usePregnancyCalculator() {
  const [method, setMethod] = useState<CalculationMethod>('lmp')
  const [lmpDate, setLmpDate] = useState<Date | undefined>(new Date())
  const [ultrasoundDate, setUltrasoundDate] = useState<Date | undefined>()
  const [gaWeeks, setGaWeeks] = useState<string>('')
  const [gaDays, setGaDays] = useState<string>('')
  const [eddDate, setEddDate] = useState<Date | undefined>()
  const [pregnancyInfo, setPregnancyInfo] = useState<PregnancyInfo | null>(null)

  useEffect(() => {
    if (method === 'reverseUltrasound') {
      if (eddDate) {
        const info = calculatePregnancyFromEdd(eddDate)
        setPregnancyInfo(info)
      } else {
        setPregnancyInfo(null)
      }
    } else if (lmpDate) {
      const parsedWeeks = Number.parseInt(gaWeeks, 10)
      const weeks = Number.isNaN(parsedWeeks) ? undefined : parsedWeeks
      const parsedDays = Number.parseInt(gaDays, 10)
      const days = Number.isNaN(parsedDays) ? undefined : parsedDays
      const info = calculatePregnancyInfo(lmpDate, ultrasoundDate, weeks, days)
      setPregnancyInfo(info)
    } else {
      setPregnancyInfo(null)
    }
  }, [method, lmpDate, ultrasoundDate, gaWeeks, gaDays, eddDate])

  const handleReset = () => {
    setLmpDate(new Date())
    setUltrasoundDate(undefined)
    setGaWeeks('')
    setGaDays('')
    setEddDate(undefined)
  }

  return {
    method,
    setMethod,
    lmpDate,
    setLmpDate,
    ultrasoundDate,
    setUltrasoundDate,
    gaWeeks,
    setGaWeeks,
    gaDays,
    setGaDays,
    eddDate,
    setEddDate,
    pregnancyInfo,
    handleReset,
  }
}
