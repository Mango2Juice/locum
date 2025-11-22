/**
 * JSON Schema Definitions using Zod
 */

import { z } from 'zod'
import { DOSE_UNIT_VALUES, FREQUENCY_VALUES } from '../types'

// Dosing profile schema
const DosingProfileSchema = z
  .object({
    formula: z.enum(['weight', 'age', 'fixed', 'weight-tiered']),
    amount: z.number().positive('Amount must be positive'),
    unit: z.enum(DOSE_UNIT_VALUES),
    frequency: z.enum(FREQUENCY_VALUES),
    maxDose: z.number().positive().optional(),
    maxDoseUnit: z.enum(DOSE_UNIT_VALUES).optional(),
    minAge: z.number().min(0).optional(),
    maxAge: z.number().min(0).optional(),
    weightThreshold: z.number().positive().optional(),
    alternativeAmount: z.number().positive().optional(),
    weightTiers: z
      .array(
        z.object({
          minWeight: z.number().min(0),
          maxWeight: z.number().positive().optional(),
          amount: z.number().positive(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.minAge !== undefined && data.maxAge !== undefined) {
        return data.minAge < data.maxAge
      }
      return true
    },
    {
      message: 'minAge must be less than maxAge',
      path: ['minAge'],
    },
  )
  .refine(
    (data) => {
      // If maxDose is defined, maxDoseUnit must also be defined. If maxDose is not defined, maxDoseUnit must not be defined.
      const maxDoseDefined = data.maxDose !== undefined
      const maxDoseUnitDefined = data.maxDoseUnit !== undefined
      return maxDoseDefined === maxDoseUnitDefined
    },
    {
      message: 'maxDoseUnit is required when maxDose is provided, and vice-versa.',
      path: ['maxDoseUnit'],
    },
  )

// Concentration schema
const ConcentrationSchema = z.object({
  amount: z.number().positive('Concentration amount must be positive'),
  unit: z.enum(['mg/ml', 'mg/5ml', 'mcg/ml', 'mcg/5ml', 'g/5ml', 'mg/tablet']),
  formulation: z.enum(['syrup', 'tablet', 'injection', 'suspension', 'nebulizer']),
})

// Main medication schema
export const QuickReferenceMedicationSchema = z.object({
  id: z.string().min(1, 'Medication ID is required'),
  name: z.string().min(1, 'Medication name is required'),
  aliases: z.array(z.string()).optional(),
  dosingProfiles: z.array(DosingProfileSchema).min(1, 'At least one dosing profile is required'),
  concentration: ConcentrationSchema,
  complaintCategories: z.array(z.string()).min(1, 'At least one complaint category is required'),
  enabled: z.boolean(),
  mainDatabaseId: z.string().optional(),
  notes: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
})
