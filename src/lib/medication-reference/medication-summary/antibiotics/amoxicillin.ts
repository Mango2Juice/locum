import type { QuickReferenceMedication } from '../../types'

/**
 * Amoxicillin (Amoxil)
 * Categories: antibiotics
 *
 * High-level summary: Common antibiotic for bacterial infections.
 * Indications: Ear, nose, throat, skin infections.
 * Contraindications: Penicillin allergy.
 * Adverse effects: Diarrhea, nausea, rash.
 * Pregnancy & Lactation: Generally considered safe.
 * Sources: MIMS, Drugs.com, local clinical guidelines.
 */
const amoxicillin: QuickReferenceMedication = {
  id: 'amoxicillin-quick',
  name: 'Amoxicillin',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 25,
      unit: 'mg/kg/day',
      frequency: 'BD',
      maxDose: 500,
      maxDoseUnit: 'mg/dose',
      minAge: 2,
    },
  ],
  concentration: {
    amount: 250,
    unit: 'mg/5ml',
    formulation: 'suspension',
  },
  complaintCategories: ['antibiotics'],
  enabled: true,
}

export default amoxicillin
