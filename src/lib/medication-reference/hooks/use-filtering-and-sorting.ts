/**
 * Hook providing filtering and sorting functionalities for the Quick Reference Database.
 */

import {
  getEnabledCategories as getEnabledCategoriesFromUtils,
  getFilteredMedications as getFiltered,
  searchMedications as search,
  sortMedicationsByName as sortByName,
} from '../filtering'
import type { QuickReferenceComplaintCategory, QuickReferenceMedication } from '../types'

/**
 * Provide filtering, searching, and sorting helpers for a set of medications.
 *
 * @param medications - The medications to be queried and sorted.
 * @param categories - Complaint categories used to derive enabled categories.
 * @returns An object with helper functions:
 *  - `getFilteredMedications(categoryId?, audience?)`: returns medications filtered by the optional category ID and audience, and limited to enabled medications.
 *  - `getEnabledCategories()`: returns the enabled complaint categories derived from `categories`.
 *  - `searchMedications(searchTerm)`: returns medications matching the search term.
 *  - `sortMedicationsByName(ascending?)`: returns medications sorted by name; pass `false` for descending order.
 */
export function useFilteringAndSorting(
  medications: QuickReferenceMedication[],
  categories: QuickReferenceComplaintCategory[],
) {
  const getFilteredMedications = (categoryId?: string | undefined, audience?: 'paediatric' | 'adult' | undefined) => {
    return getFiltered(medications, {
      categoryId,
      enabledOnly: true,
      audience,
    })
  }

  const getEnabledCategories = () => {
    return getEnabledCategoriesFromUtils(categories)
  }

  const searchMedications = (searchTerm: string) => {
    return search(medications, searchTerm)
  }

  const sortMedicationsByName = (ascending = true) => {
    return sortByName(medications, ascending)
  }

  return {
    getFilteredMedications,
    getEnabledCategories,
    searchMedications,
    sortMedicationsByName,
  }
}
