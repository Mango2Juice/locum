/**
 * Filtering and search functionality for the Quick Reference Database
 */

import type { QuickReferenceComplaintCategory, QuickReferenceMedication } from './types'

/**
 * Filter medications by complaint category
 * @lintignore
 */
export function filterByComplaintCategory(
  medications: QuickReferenceMedication[],
  categoryId?: string,
): QuickReferenceMedication[] {
  if (!categoryId || categoryId === 'all') {
    return medications
  }

  return medications.filter((medication) => medication.complaintCategories.includes(categoryId))
}

/**
 * Filter medications for pediatric audience
 */
export function filterByAudience(
  medications: QuickReferenceMedication[],
  audience: 'paediatric' | 'adult',
): QuickReferenceMedication[] {
  if (audience === 'paediatric') {
    return medications.filter((medication) => medication.dosingProfiles && medication.dosingProfiles.length > 0)
  }
  // This app is pediatric-only, so adult will return an empty array.
  return []
}

/**
 * Filter medications by enabled status
 * @lintignore
 */
export function filterByEnabled(
  medications: QuickReferenceMedication[],
  enabledOnly = true,
): QuickReferenceMedication[] {
  if (!enabledOnly) {
    return medications
  }

  return medications.filter((medication) => medication.enabled)
}

/**
 * Search medications by name or aliases
 */
export function searchMedications(
  medications: QuickReferenceMedication[],
  searchTerm: string,
): QuickReferenceMedication[] {
  if (!searchTerm.trim()) {
    return medications
  }

  const normalizedSearch = searchTerm.toLowerCase().trim()

  return medications.filter((medication) => {
    // Search in name
    if (medication.name.toLowerCase().includes(normalizedSearch)) {
      return true
    }

    // Search in aliases
    if (medication.aliases) {
      return medication.aliases.some((alias) => alias.toLowerCase().includes(normalizedSearch))
    }

    return false
  })
}

/**
 * Get filtered medications with multiple criteria
 */
export function getFilteredMedications(
  medications: QuickReferenceMedication[],
  options: {
    categoryId?: string | undefined
    enabledOnly?: boolean | undefined
    searchTerm?: string | undefined
    audience?: 'paediatric' | 'adult' | undefined
  } = {},
): QuickReferenceMedication[] {
  let filtered = medications

  // Apply enabled filter first
  filtered = filterByEnabled(filtered, options.enabledOnly ?? true)

  // Apply audience filter
  if (options.audience) {
    filtered = filterByAudience(filtered, options.audience)
  }

  // Apply category filter
  if (options.categoryId) {
    filtered = filterByComplaintCategory(filtered, options.categoryId)
  }

  // Apply search filter
  if (options.searchTerm) {
    filtered = searchMedications(filtered, options.searchTerm)
  }

  return filtered
}

/**
 * Get enabled complaint categories
 */
export function getEnabledCategories(categories: QuickReferenceComplaintCategory[]): QuickReferenceComplaintCategory[] {
  return categories.filter((category) => category.enabled).sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Find medication by ID
 */
export function findMedicationById(
  medications: QuickReferenceMedication[],
  id: string,
): QuickReferenceMedication | undefined {
  return medications.find((medication) => medication.id === id)
}

/**
 * Sort medications by name
 */
export function sortMedicationsByName(
  medications: QuickReferenceMedication[],
  ascending = true,
): QuickReferenceMedication[] {
  const sorted = [...medications].sort((a, b) => a.name.localeCompare(b.name))
  return ascending ? sorted : sorted.reverse()
}
