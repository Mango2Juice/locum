/**
 * Data loading utilities for the Quick Reference Database
 */

// Import JSON data
import categoriesData from './complaint-categories.json'
import { medications } from './medications'
import type { QuickReferenceComplaintCategory, QuickReferenceMedication } from './types'

/**
 * Error class for data loading failures
 */
class DataLoadingError extends Error {
  constructor(
    message: string,
    public readonly source: string,
    public readonly originalError?: Error,
  ) {
    super(message)
    this.name = 'DataLoadingError'
  }
}

/**
 * Load medications from JSON file with error handling
 */
export function loadMedications(): QuickReferenceMedication[] {
  try {
    if (!(medications && Array.isArray(medications))) {
      throw new Error('Invalid medications data structure')
    }

    return medications as QuickReferenceMedication[]
  } catch (error) {
    throw new DataLoadingError(
      'Failed to load medications data',
      'medications.ts',
      error instanceof Error ? error : new Error(String(error)),
    )
  }
}

/**
 * Load complaint categories from JSON file with error handling
 */
export function loadComplaintCategories(): QuickReferenceComplaintCategory[] {
  try {
    if (!(categoriesData && Array.isArray(categoriesData.categories))) {
      throw new Error('Invalid categories data structure')
    }

    return categoriesData.categories as QuickReferenceComplaintCategory[]
  } catch (error) {
    throw new DataLoadingError(
      'Failed to load complaint categories data',
      'complaint-categories.json',
      error instanceof Error ? error : new Error(String(error)),
    )
  }
}
