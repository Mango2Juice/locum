/**
 * Runtime validation and consistency checks for the Quick Reference Database
 */

import type { ZodIssue } from 'zod'
import type { QuickReferenceMedication, ValidationResult } from '../types'
import { QuickReferenceMedicationSchema } from './schemas'

/**
 * Validate medication data structure
 */
export function validateMedication(medication: QuickReferenceMedication): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Use Zod schema for primary validation
  const result = QuickReferenceMedicationSchema.safeParse(medication)

  if (!result.success) {
    errors.push(...result.error.issues.map((e: ZodIssue) => `${e.path.map(String).join('.')}: ${e.message}`))
  } else {
    // Additional business logic checks if schema is valid, using the validated data
    const validatedData = result.data
    if (validatedData.dosingProfiles) {
      for (let i = 0; i < validatedData.dosingProfiles.length; i++) {
        const profile = validatedData.dosingProfiles[i]
        if (
          profile &&
          profile.minAge !== undefined &&
          profile.maxAge !== undefined &&
          profile.minAge >= profile.maxAge
        ) {
          errors.push(`Dosing profile #${i + 1}: Minimum age must be less than maximum age`)
        }
      }
    }
    if (!validatedData.complaintCategories || validatedData.complaintCategories.length === 0) {
      warnings.push('No complaint categories assigned')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
