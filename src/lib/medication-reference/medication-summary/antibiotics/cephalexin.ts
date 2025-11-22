import type { QuickReferenceMedication } from '../../types'

const cephalexin: QuickReferenceMedication = {
  id: 'cephalexin-quick',
  name: 'Cephalexin',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 12.5,
      unit: 'mg/kg/day',
      frequency: 'BD',
      maxDose: 500,
      maxDoseUnit: 'mg/dose',
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

export default cephalexin
