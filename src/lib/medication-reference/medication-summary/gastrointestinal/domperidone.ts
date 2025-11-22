import type { QuickReferenceMedication } from '../../types'

/**
 * Domperidone (Motilium)
 * Categories: gastrointestinal
 *
 * High-level summary: Anti-nausea agent (prokinetic).
 * Indications: Nausea, vomiting.
 * Contraindications: Heart conditions (QT prolongation), liver impairment, use with other QT-prolonging drugs.
 * Adverse effects: Dry mouth, headache, risk of serious cardiac side effects.
 * Pregnancy & Lactation: Use with caution. Excreted in breast milk.
 * Sources: MIMS, BNFc, MHRA safety alerts.
 */
const domperidone: QuickReferenceMedication = {
  id: 'domperidone-quick',
  name: 'Domperidone',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 0.25,
      unit: 'mg/kg/dose',
      frequency: 'TDS',
      maxDose: 10,
      maxDoseUnit: 'mg/dose',
      minAge: 12,
    },
  ],
  concentration: {
    amount: 5,
    unit: 'mg/5ml',
    formulation: 'suspension',
  },
  complaintCategories: ['gastrointestinal'],
  enabled: false,
}

export default domperidone
