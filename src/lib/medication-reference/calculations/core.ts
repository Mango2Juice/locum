/**
 * Core calculation engine for the Quick Reference Database.
 */

import type { QuickReferenceCalculationResult, QuickReferenceMedication } from '../types'
import { calculatePediatricDose } from './pediatric'

/**
 * Main calculation function for a given medication.
 * It currently defaults to pediatric calculations.
 */
export function calculateDose(
  medication: QuickReferenceMedication,
  weight: number,
  ageMonths?: number,
): QuickReferenceCalculationResult | null {
  if (!medication.enabled) {
    return null
  }

  // Currently, the quick reference only supports pediatric dosing.
  // This can be expanded to include adult dosing logic if needed.
  return calculatePediatricDose(medication, weight, ageMonths)
}
