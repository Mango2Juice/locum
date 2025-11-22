/**
 * Utility functions for the calculation engine.
 */
import { averageWeights } from '@/lib/growth-charts'
import type { QuickReferenceMedication } from '../types'

/**
 * Calculates mg/mL from a concentration object.
 */
export function getMgPerMl(concentration: QuickReferenceMedication['concentration']): number {
  if (!concentration) {
    throw new Error('Concentration must be provided to calculate mg/mL.')
  }

  const unit = concentration.unit.toLowerCase()

  if (unit.endsWith('/5ml')) {
    return concentration.amount / 5
  }
  if (unit.endsWith('/ml')) {
    return concentration.amount
  }
  if (unit.endsWith('/tablet')) {
    return concentration.amount
  }
  throw new Error(`Unsupported concentration unit for mg/mL conversion: ${concentration.unit}`)
}

/**
 * Calculate administration volume based on dose and concentration.
 */
export function calculateAdminVolume(
  doseMg: number,
  concentration?: QuickReferenceMedication['concentration'],
): number | null {
  if (doseMg <= 0 || !concentration) {
    return null
  }

  const { amount, unit } = concentration

  if (unit.includes('ml')) {
    let mgPerMl = 0
    if (unit.endsWith('/5ml')) {
      mgPerMl = amount / 5
    } else if (unit.endsWith('/ml')) {
      mgPerMl = amount
    }

    if (mgPerMl > 0) {
      return Number((doseMg / mgPerMl).toFixed(2))
    }
  }

  return null
}

/**
 * Get the appropriate administration unit based on concentration.
 */
export function getAdminUnit(concentration?: QuickReferenceMedication['concentration']): string {
  if (!concentration?.formulation) {
    return 'N/A'
  }
  if (['syrup', 'suspension', 'injection'].includes(concentration.formulation.toLowerCase())) {
    return 'ml'
  }
  if (concentration.formulation.toLowerCase() === 'tablet') {
    return 'tablet(s)'
  }
  return 'dose(s)'
}

/**
 * Get the estimated weight for a given age in months.
 * @param ageInMonths The age in months.
 * @returns The estimated weight in kg, or undefined if not available.
 */
export const getWeightForAge = (ageInMonths: number): number | undefined => {
  if (ageInMonths < 0 || averageWeights.length === 0) return undefined

  // Handle ages outside the data range
  const firstPoint = averageWeights[0]
  if (firstPoint && ageInMonths < firstPoint.ageMonths) return undefined

  const lastPoint = averageWeights[averageWeights.length - 1]
  if (lastPoint && ageInMonths > lastPoint.ageMonths) return lastPoint.weightKg

  // Find the two closest data points for interpolation
  const lowerBound = averageWeights
    .slice()
    .reverse()
    .find((p) => p.ageMonths <= ageInMonths)
  const upperBound = averageWeights.find((p) => p.ageMonths > ageInMonths)

  if (!lowerBound) return upperBound?.weightKg // Should be covered by firstPoint check, but for safety
  if (!upperBound) return lowerBound.weightKg // Should be covered by lastPoint check, but for safety

  // Handle exact match
  if (lowerBound.ageMonths === ageInMonths) return lowerBound.weightKg

  // Linear interpolation
  const ageRange = upperBound.ageMonths - lowerBound.ageMonths
  const weightRange = upperBound.weightKg - lowerBound.weightKg
  const ageOffset = ageInMonths - lowerBound.ageMonths

  const interpolatedWeight = lowerBound.weightKg + (ageOffset / ageRange) * weightRange

  // Round to one decimal place
  return Math.round(interpolatedWeight * 10) / 10
}
