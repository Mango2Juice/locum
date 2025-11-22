import type { QuickReferenceMedication } from '../../types'

/**
 * Augmentin (Amoxicillin/Clavulanate, Co-amoxiclav)
 * Categories: antibiotics
 *
 * High-level summary: Broad-spectrum antibiotic for resistant bacteria.
 * Indications: Sinusitis, pneumonia, skin infections, animal bites.
 * Contraindications: Penicillin allergy, history of liver problems with Augmentin.
 * Adverse effects: Diarrhea (common), nausea, rash.
 * Pregnancy & Lactation: Use if benefit outweighs risk. Compatible with breastfeeding.
 * Sources: MIMS, Drugs.com, local clinical guidelines.
 */
const augmentin_228: QuickReferenceMedication = {
  id: 'augmentin-228-quick',
  name: 'Augmentin (228mg)',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 25,
      unit: 'mg/kg/day',
      frequency: 'BD',
      maxDose: 875,
      maxDoseUnit: 'mg/dose',
      minAge: 2,
    },
  ],
  concentration: {
    amount: 200, // based on amoxicillin component
    unit: 'mg/5ml',
    formulation: 'suspension',
  },
  complaintCategories: ['antibiotics'],
  enabled: true,
}

export default augmentin_228
