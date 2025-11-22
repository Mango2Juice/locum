/**
 * Business logic validation rules for the Quick Reference Database
 */

import type { DosingProfile, QuickReferenceMedication, ValidationResult } from '../types'

/**
 * Validation constants
 * @lintignore
 */
export const VALIDATION_LIMITS = {
  MIN_WEIGHT: 0.5, // kg
  MAX_WEIGHT: 200, // kg
  MIN_AGE: 0, // months
  MAX_AGE: 1200, // months (100 years)
  MIN_DOSE: 0.001, // mg
  MAX_DOSE: 50000, // mg
} as const

/**
 * Validate weight input
 */
export function validateWeight(weight: number): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (weight <= 0) {
    errors.push('Weight must be greater than 0')
  } else if (weight < VALIDATION_LIMITS.MIN_WEIGHT) {
    warnings.push(`Weight is very low (${weight}kg). Please verify.`)
  } else if (weight > VALIDATION_LIMITS.MAX_WEIGHT) {
    warnings.push(`Weight is very high (${weight}kg). Please verify.`)
  }

  // Additional weight-based warnings
  if (weight > 0 && weight < 2) {
    warnings.push('Neonatal dosing may require special considerations')
  }

  if (weight > 100) {
    warnings.push('Weight exceeds typical pediatric range')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate age input
 */
export function validateAge(ageMonths: number): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (ageMonths < 0) {
    errors.push('Age cannot be negative')
  } else if (ageMonths > VALIDATION_LIMITS.MAX_AGE) {
    warnings.push(`Age is very high (${Math.round(ageMonths / 12)} years). Please verify.`)
  }

  // Age-specific warnings
  if (ageMonths < 1) {
    warnings.push('Neonatal dosing requires special considerations')
  }

  if (ageMonths > 216) {
    // 18 years
    warnings.push('Patient age exceeds typical pediatric range (over 18 years)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate calculated dose
 */
export function validateDose(doseMg: number, medication: QuickReferenceMedication): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (doseMg <= 0) {
    errors.push('Calculated dose must be greater than 0')
    return { isValid: false, errors, warnings }
  }

  if (doseMg < VALIDATION_LIMITS.MIN_DOSE) {
    warnings.push(`Dose is very small (${doseMg}mg). Please verify calculation.`)
  }

  if (doseMg > VALIDATION_LIMITS.MAX_DOSE) {
    errors.push(`Dose exceeds safety limit (${doseMg}mg > ${VALIDATION_LIMITS.MAX_DOSE}mg)`)
  }

  // Check against medication-specific limits from all profiles
  const maxDoses = medication.dosingProfiles.map((p) => p.maxDose).filter(Boolean) as number[]
  if (maxDoses.length > 0) {
    const overallMaxDose = Math.max(...maxDoses)
    if (doseMg > overallMaxDose) {
      errors.push(`Dose exceeds medication maximum (${doseMg}mg > ${overallMaxDose}mg)`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate age against medication age limits
 */
export function validateAgeForMedication(
  ageMonths: number,
  medication: QuickReferenceMedication,
  dosingProfile?: DosingProfile,
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const profile = dosingProfile || medication.dosingProfiles[0]

  if (!profile) {
    return { isValid: false, errors: ['No dosing profile to validate against.'], warnings: [] }
  }

  const { minAge, maxAge } = profile

  if (minAge !== undefined && ageMonths < minAge) {
    errors.push(`Patient age (${ageMonths} months) is below minimum age for ${medication.name} (${minAge} months)`)
  }

  if (maxAge !== undefined && ageMonths >= maxAge) {
    warnings.push(`Patient age (${ageMonths} months) is above maximum age for ${medication.name} (${maxAge} months)`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Generate warnings for edge cases in pediatric dosing.
 */
export function generateEdgeCaseWarnings(weight: number, medication: QuickReferenceMedication): string[] {
  const warnings: string[] = []
  if (weight > 40 && medication.dosingProfiles.some((p) => p.formula === 'weight')) {
    warnings.push('Weight is high for pediatric dosing. Consider adult dosing if appropriate.')
  }
  return warnings
}
