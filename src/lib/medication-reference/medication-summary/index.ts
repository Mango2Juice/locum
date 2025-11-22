import type { QuickReferenceMedication } from '../types'

import { medications as analgesics } from './analgesics'
import { medications as antibiotics } from './antibiotics'
import { medications as antihistamines } from './antihistamines'
import { medications as antispasmodics } from './antispasmodics'
import { medications as corticosteroids } from './corticosteroids'
import { medications as gastrointestinal } from './gastrointestinal'
import { medications as respiratory } from './respiratory'

/**
 * Aggregated list of all medications from individual category files.
 */
export const medications: QuickReferenceMedication[] = [
  ...analgesics,
  ...antibiotics,
  ...antihistamines,
  ...antispasmodics,
  ...corticosteroids,
  ...gastrointestinal,
  ...respiratory,
]
