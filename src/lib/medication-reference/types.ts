// src/lib/quick-reference-database/types.ts
/**
 * TypeScript interfaces for the Quick Reference Database
 */

// Allowed dosing frequency literals. Extend as needed.
export const FREQUENCY_VALUES = ['OD', 'BD', 'TDS', 'QID', 'PRN', '5x'] as const
export type Frequency = (typeof FREQUENCY_VALUES)[number]
export type AgeInputUnit = 'years' | 'months'

export const DOSE_UNIT_VALUES = [
  'mg/kg/day',
  'mg/kg/dose',
  'mg/dose',
  'mg/day',
  'mcg/kg/day',
  'mcg/kg/dose',
  'mcg/dose',
  'mcg/day',
  'mL/kg/day',
  'mL/kg/dose',
  'mL/dose',
  'mL/day',
] as const
export type DoseUnit = (typeof DOSE_UNIT_VALUES)[number]

export interface DosingProfile {
  formula: 'weight' | 'age' | 'fixed' | 'weight-tiered'
  amount: number
  unit: DoseUnit
  frequency: Frequency
  maxDose?: number
  maxDoseUnit?: DoseUnit
  minAge?: number // months
  maxAge?: number // months
  weightThreshold?: number // kg - if weight >= threshold, use alternativeAmount
  alternativeAmount?: number
  weightTiers?: {
    minWeight: number
    maxWeight?: number
    amount: number
  }[]
}

export interface QuickReferenceMedication {
  id: string
  name: string
  aliases?: string[]
  dosingProfiles: DosingProfile[]
  concentration: {
    amount: number
    unit: 'mg/ml' | 'mg/5ml' | 'mcg/ml' | 'mcg/5ml' | 'g/5ml'
    formulation: 'syrup' | 'injection' | 'suspension' | 'nebulizer' | 'tablet'
  }
  complaintCategories: string[]
  enabled: boolean
  mainDatabaseId?: string
  notes?: string[]
  warnings?: string[]
}

export interface QuickReferenceComplaintCategory {
  id: string
  name: string
  displayName: string
  color: string
  enabled: boolean
  sortOrder: number
}

export interface QuickReferenceCalculationResult {
  medicationId: string
  doseMg: number
  adminVolume: number | null
  adminUnit: string
  frequency: Frequency | 'N/A'
  formulation: string
  isValid: boolean
  warnings: string[]
  notes: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ErrorRecoveryOptions {
  fallbackToDefaults: boolean
  skipInvalidItems: boolean
  logErrors: boolean
  showUserFriendlyMessages: boolean
}

export interface ErrorContext {
  operation: 'LOAD_MEDICATIONS' | 'LOAD_CATEGORIES' | 'VALIDATE_MEDICATION' | 'CALCULATE_DOSE'
  medicationId?: string
  categoryId?: string
  timestamp?: Date
}

export interface QuickReferenceCalculation {
  medicationId: string
  doseMg: number
  doseRateText: string | null
  adminVolumeMl: number | null
  frequencyText: string
  formulationText: string
  hasWarnings: boolean
  warningCount: number
  isCalculationValid: boolean
  concentrationText?: string
}
