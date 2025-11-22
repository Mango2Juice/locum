/**
 * Pediatric dose calculation logic for the Quick Reference Database.
 */
import type { DosingProfile, QuickReferenceCalculationResult, QuickReferenceMedication } from '../types'
import {
  generateEdgeCaseWarnings,
  validateAge,
  validateAgeForMedication,
  validateDose,
  validateWeight,
} from '../validation/rules'
import { computeDoseFromProfile } from './helpers'
import { calculateAdminVolume, getAdminUnit, getMgPerMl } from './utils'

/**
 * Selects the most appropriate dosing profile based on weight and age.
 */
function getDosingProfile(
  medication: QuickReferenceMedication,
  weight?: number,
  ageMonths?: number,
): DosingProfile | undefined {
  if (!medication.dosingProfiles || medication.dosingProfiles.length === 0) {
    return undefined
  }

  // Filter profiles that match the patient's age
  const matchingProfiles = medication.dosingProfiles.filter(
    (p) =>
      (p.minAge === undefined || (ageMonths !== undefined && ageMonths >= p.minAge)) &&
      (p.maxAge === undefined || (ageMonths !== undefined && ageMonths < p.maxAge)),
  )

  if (matchingProfiles.length === 0) {
    return undefined
  }

  // If weight is available, prioritize profiles that use it
  if (weight !== undefined) {
    const tieredProfile = matchingProfiles.find((p) => p.formula === 'weight-tiered')
    if (tieredProfile) return tieredProfile

    const weightProfile = matchingProfiles.find((p) => p.formula === 'weight')
    if (weightProfile) return weightProfile

    const thresholdProfile = matchingProfiles.find((p) => p.weightThreshold !== undefined)
    if (thresholdProfile) return thresholdProfile
  }

  // Fallback to the first matching profile
  return matchingProfiles[0]
}

/**
 * Calculate pediatric dose based on weight and age. This is the main calculation engine.
 */
export function calculatePediatricDose(
  medication: QuickReferenceMedication,
  weight: number,
  ageMonths?: number,
): QuickReferenceCalculationResult {
  const warnings: string[] = []
  const notes: string[] = [...(medication.notes || [])]

  // 1. Validate Inputs (Weight and Age)
  const weightValidation = validateWeight(weight)
  if (!weightValidation.isValid) {
    return {
      medicationId: medication.id,
      doseMg: 0,
      adminVolume: null,
      adminUnit: 'N/A',
      frequency: 'N/A',
      formulation: medication.concentration?.formulation ?? 'N/A',
      isValid: false,
      warnings: weightValidation.errors,
      notes,
    }
  }
  warnings.push(...weightValidation.warnings)

  if (ageMonths !== undefined) {
    const ageValidation = validateAge(ageMonths)
    if (!ageValidation.isValid) {
      return {
        medicationId: medication.id,
        doseMg: 0,
        adminVolume: null,
        adminUnit: 'N/A',
        frequency: 'N/A',
        formulation: medication.concentration?.formulation ?? 'N/A',
        isValid: false,
        warnings: ageValidation.errors,
        notes,
      }
    }
    warnings.push(...ageValidation.warnings)
  }

  // 2. Select the correct dosing profile
  const dosingProfile = getDosingProfile(medication, weight, ageMonths)
  if (!dosingProfile) {
    return {
      medicationId: medication.id,
      doseMg: 0,
      adminVolume: null,
      adminUnit: 'N/A',
      frequency: 'N/A',
      formulation: medication.concentration?.formulation ?? 'N/A',
      isValid: false,
      warnings: ['No suitable dosing profile found for the given age and weight.'],
      notes,
    }
  }

  // 3. Validate age against the selected medication profile
  if (ageMonths !== undefined) {
    const ageForMedValidation = validateAgeForMedication(ageMonths, medication, dosingProfile)
    if (!ageForMedValidation.isValid) {
      return {
        medicationId: medication.id,
        doseMg: 0,
        adminVolume: null,
        adminUnit: 'N/A',
        frequency: dosingProfile.frequency,
        formulation: medication.concentration?.formulation ?? 'N/A',
        isValid: false,
        warnings: ageForMedValidation.errors,
        notes,
      }
    }
    warnings.push(...ageForMedValidation.warnings)
  }

  // 4. Core Dose Calculation
  const mgPerMl = getMgPerMl(medication.concentration)

  // Determine doses per day from frequency for daily dose calculations
  const frequencyMap: Record<string, number> = { OD: 1, BD: 2, TDS: 3, QID: 4 }
  const dosesPerDay = frequencyMap[dosingProfile.frequency.toUpperCase()] || 1
  const isPerDayUnit = dosingProfile.unit.endsWith('/day')

  const computeResult = computeDoseFromProfile(dosingProfile, weight, mgPerMl)
  if (computeResult.error !== undefined) {
    return {
      medicationId: medication.id,
      doseMg: 0,
      adminVolume: null,
      adminUnit: 'N/A',
      frequency: dosingProfile.frequency,
      formulation: medication.concentration?.formulation ?? 'N/A',
      isValid: false,
      warnings: [computeResult.error],
      notes,
    }
  }

  const calculatedDose = computeResult.calculatedDose ?? 0

  // 5. Adjust for Daily vs. Per-Dose Units
  let doseMg = calculatedDose
  if (isPerDayUnit && dosesPerDay > 1) {
    doseMg = calculatedDose / dosesPerDay
  }

  // 6. Apply Maximum Dose Limits
  if (dosingProfile.maxDose) {
    let maxDoseValue = dosingProfile.maxDose
    if (dosingProfile.maxDoseUnit?.includes('/kg')) {
      maxDoseValue *= weight
    }

    // If the max dose is a daily limit, compare total daily dose against it
    const totalDailyDose = doseMg * dosesPerDay
    if (totalDailyDose > maxDoseValue) {
      warnings.push(`Dose capped at daily maximum of ${maxDoseValue.toFixed(2)}mg.`)
      doseMg = maxDoseValue / dosesPerDay
    } else {
      // Otherwise, it's a per-dose limit
      if (doseMg > maxDoseValue) {
        warnings.push(`Dose capped at maximum of ${maxDoseValue.toFixed(2)}mg.`)
        doseMg = maxDoseValue
      }
    }
  }

  // 7. Final Validations and Result Assembly
  const doseValidation = validateDose(doseMg, medication)
  if (!doseValidation.isValid) {
    return {
      medicationId: medication.id,
      doseMg: 0,
      adminVolume: null,
      adminUnit: 'N/A',
      frequency: dosingProfile.frequency,
      formulation: medication.concentration?.formulation ?? 'N/A',
      isValid: false,
      warnings: [...warnings, ...doseValidation.errors],
      notes,
    }
  }
  warnings.push(...doseValidation.warnings)

  if (medication.warnings) {
    warnings.push(...medication.warnings)
  }

  if (ageMonths !== undefined) {
    warnings.push(...generateEdgeCaseWarnings(weight, medication))
  }

  const adminVolume = calculateAdminVolume(doseMg, medication.concentration)

  return {
    medicationId: medication.id,
    doseMg,
    adminVolume,
    adminUnit: getAdminUnit(medication.concentration),
    frequency: dosingProfile.frequency,
    formulation: medication.concentration?.formulation ?? 'N/A',
    isValid: doseMg > 0,
    warnings,
    notes,
  }
}
