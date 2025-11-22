import type { QuickReferenceMedication } from '../../types'

/**
 * Loratadine (Claritin)
 * Categories: allergy
 *
 * BNFc, MIMS, Frank Shann:
 * 2–11 years (body-weight < 31kg): 5mg once daily
 * 2–11 years (body-weight >= 31kg): 10mg once daily
 * 12–17 years: 10mg once daily
 */
const loratadine: QuickReferenceMedication = {
  id: 'loratadine-quick',
  name: 'Loratadine',
  dosingProfiles: [
    {
      minAge: 24, // 2 years
      maxAge: 143, // up to 12 years
      formula: 'weight-tiered',
      amount: 5, // Default dose for weight < 30kg
      unit: 'mg/dose',
      frequency: 'OD',
      maxDose: 10,
      maxDoseUnit: 'mg/dose',
      weightTiers: [
        {
          minWeight: 0,
          maxWeight: 30.99,
          amount: 5,
        },
        {
          minWeight: 31,
          amount: 10,
        },
      ],
    },
    {
      minAge: 144, // 12 years and older
      formula: 'fixed',
      amount: 10,
      unit: 'mg/dose',
      frequency: 'OD',
      maxDose: 10,
      maxDoseUnit: 'mg/dose',
    },
  ],
  concentration: {
    amount: 5,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['allergy'],
  enabled: true,
  mainDatabaseId: 'loratadine',
  notes: [
    'Long-acting, non-sedating antihistamine.',
    'Indications: Allergic rhinitis, urticaria (hives).',
    'Dosing for 2-12 years is weight-dependent.',
  ],
  warnings: [
    'Caution in severe liver disease.',
    'Consider dose adjustment in renal impairment.',
    'Excreted in breast milk; use with caution.',
  ],
}

export default loratadine
