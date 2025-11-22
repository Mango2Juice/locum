import type { QuickReferenceMedication } from '../../types'

/**
 * Metronidazole (Flagyl)
 * Categories: antibiotics
 *
 * High-level summary: Antibiotic for anaerobic bacteria and protozoa.
 * Indications: Giardiasis, amoebiasis, C. difficile colitis.
 * Contraindications: First trimester of pregnancy, alcohol use.
 * Adverse effects: Metallic taste, nausea, headache.
 * Pregnancy & Lactation: Avoid in first trimester. Use with caution in lactation.
 * Sources: MIMS, Drugs.com, local clinical guidelines.
 */
const metronidazole: QuickReferenceMedication = {
  id: 'metronidazole-quick',
  name: 'Metronidazole',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 7.5,
      unit: 'mg/kg/dose',
      frequency: 'TDS',
      maxDose: 400,
      maxDoseUnit: 'mg/dose',
      minAge: 2,
    },
  ],
  concentration: {
    amount: 200,
    unit: 'mg/5ml',
    formulation: 'suspension',
  },
  complaintCategories: ['antibiotics'],
  enabled: true,
}

export default metronidazole
