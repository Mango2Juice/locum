// src/lib/stores/calculator-store.ts
'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AgeInputUnit, QuickReferenceCalculation } from '@/lib/quick-reference-database'

interface CalculatorState {
  // Quick Reference State
  displayWeight: number | undefined
  displayAge: number
  displayAgeUnit: AgeInputUnit
  isWeightManuallyEntered: boolean
  selectedComplaintFilter: string | null
  drugCalculationResults: Map<string, QuickReferenceCalculation>

  // Quick Reference Actions
  setDisplayWeight: (weight: number | undefined) => void
  setDisplayAge: (age: number, unit: AgeInputUnit) => void
  setIsWeightManuallyEntered: (isManual: boolean) => void
  setSelectedComplaintFilter: (complaintId: string | null) => void
  setDrugCalculationResults: (results: Map<string, QuickReferenceCalculation>) => void
  resetQuickReferenceState: () => void
}

export const calculationIsEqual = (
  a: QuickReferenceCalculation | undefined,
  b: QuickReferenceCalculation | undefined,
): boolean => {
  if (!a || !b) return a === b
  return (
    a.medicationId === b.medicationId &&
    a.doseMg === b.doseMg &&
    a.adminVolumeMl === b.adminVolumeMl &&
    a.isCalculationValid === b.isCalculationValid &&
    a.frequencyText === b.frequencyText &&
    a.formulationText === b.formulationText &&
    a.concentrationText === b.concentrationText &&
    a.doseRateText === b.doseRateText &&
    a.hasWarnings === b.hasWarnings &&
    a.warningCount === b.warningCount
  )
}

export const mapIsEqual = (
  map1: Map<string, QuickReferenceCalculation>,
  map2: Map<string, QuickReferenceCalculation>,
): boolean => {
  if (map1.size !== map2.size) return false
  for (const key of map1.keys()) {
    const val = map1.get(key)

    const other = map2.get(key)
    if (other === undefined || !calculationIsEqual(val, other)) {
      return false
    }
  }
  return true
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      // Quick Reference Initial State
      displayWeight: undefined,
      displayAge: 6,
      displayAgeUnit: 'years',
      isWeightManuallyEntered: false,
      selectedComplaintFilter: null,
      drugCalculationResults: new Map(),

      // Quick Reference Actions
      setDisplayWeight: (weight) => set({ displayWeight: weight }),
      setDisplayAge: (age, unit) => set({ displayAge: age, displayAgeUnit: unit }),
      setIsWeightManuallyEntered: (isManual) => set({ isWeightManuallyEntered: isManual }),
      setSelectedComplaintFilter: (complaintId) => set({ selectedComplaintFilter: complaintId }),
      setDrugCalculationResults: (results) => {
        if (!mapIsEqual(get().drugCalculationResults, results)) {
          set({ drugCalculationResults: results })
        }
      },

      resetQuickReferenceState: () => {
        set({
          displayWeight: undefined,
          displayAge: 6,
          displayAgeUnit: 'years',
          isWeightManuallyEntered: false,
          selectedComplaintFilter: null,
          drugCalculationResults: new Map(),
        })
      },
    }),
    {
      name: 'doses-calculator-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user inputs, not calculated results
      partialize: (state) => ({
        displayWeight: state.displayWeight,
        displayAge: state.displayAge,
        displayAgeUnit: state.displayAgeUnit,
        selectedComplaintFilter: state.selectedComplaintFilter,
        isWeightManuallyEntered: state.isWeightManuallyEntered,
      }),
    },
  ),
)
