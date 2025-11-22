/**
 * Quick Reference Database
 *
 * A simplified medication database for rapid dosage calculations
 * in the quick reference interface.
 */

/** @lintignore ignore knip */
export { calculateAdminVolume, calculateDose, calculatePediatricDose } from './calculations'
/** @lintignore */
export { default as categoriesData } from './complaint-categories.json'
// Database management utilities
export * from './data-loader'
export * from './filtering'
export * from './hooks/index'
// Re-export medication-summary data
/** @lintignore */
export { medications as medicationsData } from '@/lib/medication-reference/medication-summary/index'
export * from './types'
export * from './validation'
