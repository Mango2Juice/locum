/**
 * Composed hook that provides a unified interface for all quick reference database functionalities.
 * It combines smaller, focused hooks for a clean and comprehensive API.
 */

import { useCallback } from 'react'
import type { QuickReferenceComplaintCategory, QuickReferenceMedication, ValidationResult } from '../types'
import { validateMedication } from '../validation'
import { useCalculation } from './use-calculation'
import { useFilteringAndSorting } from './use-filtering-and-sorting'

/**
 * Composes quick-reference hooks to provide a unified API for medication-summary and complaint categories.
 *
 * @param initialMedications - The initial array of quick-reference medication-summary supplied to the hook; returned `medication-summary` reflects this array and may be updated by management operations.
 * @param initialCategories - The initial array of quick-reference complaint categories exposed as `categories`.
 * @returns An object containing:
 * - `medication-summary`: the current medication-summary array (may be updated),
 * - `categories`: the provided complaint categories,
 * - `isLoading`: a boolean loading flag,
 * - `error`: any loading or operational error (or `null`),
 * - all properties returned by the filtering and calculation hooks,
 * - `validateMedication`: a function that validates a medication and returns a `ValidationResult`.
 * @lintignore ignore knip
 */
export function useQuickReferenceDatabase(
  initialMedications: QuickReferenceMedication[],
  initialCategories: QuickReferenceComplaintCategory[],
) {
  const filtering = useFilteringAndSorting(initialMedications, initialCategories)
  const calculation = useCalculation(initialMedications)

  const validateMedicationCallback = useCallback((medication: QuickReferenceMedication): ValidationResult => {
    return validateMedication(medication)
  }, [])

  return {
    medications: initialMedications,
    categories: initialCategories,
    isLoading: false,
    error: null,
    ...filtering,
    ...calculation,
    validateMedication: validateMedicationCallback,
  }
}
