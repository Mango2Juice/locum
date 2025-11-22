import type { QuickReferenceMedication } from '../../types'

/**
 * Erythromycin (Eryc)
 * Categories: antibiotics
 *
 * High-level summary: Macrolide antibiotic, alternative to penicillin.
 * Indications: Whooping cough, diphtheria, atypical pneumonia.
 * Contraindications: Allergy to macrolides, certain heart conditions (QT prolongation).
 * Adverse effects: GI upset (very common), nausea, vomiting.
 * Pregnancy & Lactation: Generally safe. Use with caution in lactation.
 * Sources: MIMS, Drugs.com, local clinical guidelines.
 */
const erythromycin: QuickReferenceMedication = {
  id: 'erythromycin-quick',
  name: 'Erythromycin',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 12.5,
      unit: 'mg/kg/dose',
      frequency: 'QID',
      maxDose: 500,
      minAge: 2,
    },
  ],
  concentration: {
    amount: 125,
    unit: 'mg/5ml',
    formulation: 'suspension',
  },
  complaintCategories: ['antibiotics'],
  enabled: true,
}

export default erythromycin
