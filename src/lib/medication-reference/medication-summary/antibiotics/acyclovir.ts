import type { QuickReferenceMedication } from '../../types'

/**
 * Acyclovir (Zovirax)
 * Categories: antiviral
 *
 * High-level summary: Antiviral for herpes virus infections.
 * Indications: Chickenpox, shingles, herpes simplex.
 * Contraindications: Allergy to acyclovir or valacyclovir.
 * Adverse effects: Nausea, vomiting, headache, diarrhea.
 * Pregnancy & Lactation: Use if benefit outweighs risk. Excreted in breast milk.
 * Sources: MIMS, Drugs.com, local clinical guidelines.
 */
const acyclovir: QuickReferenceMedication = {
  id: 'acyclovir-quick',
  name: 'Acyclovir',
  dosingProfiles: [
    {
      minAge: 1,
      maxAge: 23,
      formula: 'fixed',
      amount: 200,
      unit: 'mg/dose',
      frequency: 'QID',
    },
    {
      minAge: 24,
      maxAge: 71,
      formula: 'fixed',
      amount: 400,
      unit: 'mg/dose',
      frequency: 'QID',
    },
    {
      minAge: 72,
      maxAge: 143,
      formula: 'fixed',
      amount: 800,
      unit: 'mg/dose',
      frequency: 'QID',
    },
  ],
  concentration: {
    amount: 200,
    unit: 'mg/5ml',
    formulation: 'suspension',
  },
  complaintCategories: ['antiviral'],
  enabled: true,
}

export default acyclovir
