import type { QuickReferenceMedication } from '../../types'

/**
 * Gravol (Dimenhydrinate)
 * Categories: gastrointestinal
 *
 * High-level summary: Antihistamine used for nausea and motion sickness.
 * Indications: Motion sickness, nausea, vomiting, dizziness.
 * Contraindications: Children under 2, allergy to dimenhydrinate.
 * Adverse effects: Drowsiness, dizziness, dry mouth.
 * Pregnancy & Lactation: Use with caution.
 * Sources: MIMS, Drugs.com, local clinical guidelines.
 */
const gravol: QuickReferenceMedication = {
  id: 'gravol-quick',
  name: 'Gravol',
  dosingProfiles: [
    {
      minAge: 24, // 2 years
      maxAge: 71, // up to 6 years
      formula: 'fixed',
      amount: 15,
      unit: 'mg/dose',
      frequency: 'TDS',
      maxDose: 25,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 72, // 6 years
      maxAge: 143, // up to 12 years
      formula: 'fixed',
      amount: 25,
      unit: 'mg/dose',
      frequency: 'TDS',
      maxDose: 50,
      maxDoseUnit: 'mg/dose',
    },
  ],
  concentration: {
    amount: 15,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['gastrointestinal'],
  enabled: true,
}

export default gravol
