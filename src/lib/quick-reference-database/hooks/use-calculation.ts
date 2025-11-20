/**
 * Hook for handling dosage calculations within the Quick Reference Database.
 */

import { useRef } from 'react'
import { calculateDose } from '../calculations'
import type { QuickReferenceCalculationResult, QuickReferenceMedication } from '../types'

interface CalculationCache {
  [key: string]: {
    result: QuickReferenceCalculationResult | null
    timestamp: number
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const CACHE_CLEANUP_PROBABILITY = 0.1 // Run cleanup on 10% of calls

/**
 * Provide a cached dosage-calculation function for a list of medications.
 *
 * @param medications - Array of medications used to look up medication data by id when calculating doses
 * @returns An object with `calculateDose(medicationId, weight, age?)` which returns the calculated `QuickReferenceCalculationResult` for the specified medication, weight, and optional age, or `null` if the medication id is not found. Cached results are returned while fresh; cache entries expire after the configured duration.
 */
export function useCalculation(medications: QuickReferenceMedication[]) {
  const calculationCache = useRef<CalculationCache>({})

  const generateCacheKey = (medicationId: string, weight: number, age?: number) => {
    const ageStr = age === undefined ? 'no-age' : age.toString()
    return `${medicationId}-${weight}-${ageStr}`
  }

  const clearExpiredCache = () => {
    const now = Date.now()
    const cache = calculationCache.current
    for (const key of Object.keys(cache)) {
      const entry = cache[key]
      if (entry && now - entry.timestamp > CACHE_DURATION) {
        delete cache[key]
      }
    }
  }

  const calculateDoseCallback = (
    medicationId: string,
    weight: number,
    age?: number,
  ): QuickReferenceCalculationResult | null => {
    const medication = medications.find((med) => med.id === medicationId)
    if (!medication) {
      return null
    }

    const cacheKey = generateCacheKey(medicationId, weight, age)
    const cached = calculationCache.current[cacheKey]

    if (cached?.timestamp && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result
    }

    const result = calculateDose(medication, weight, age)

    calculationCache.current[cacheKey] = {
      result,
      timestamp: Date.now(),
    }

    // Probabilistically clear expired cache to avoid doing it on every calculation
    if (Math.random() < CACHE_CLEANUP_PROBABILITY) {
      clearExpiredCache()
    }

    return result
  }

  return {
    calculateDose: calculateDoseCallback,
  }
}
