// src/app/page.tsx
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { QuickDrugReferencePage } from '@/components/quick-reference'
import { getWeightForAge } from '@/lib/quick-reference-database/calculations'
import { loadComplaintCategories, loadMedications } from '@/lib/quick-reference-database/data-loader'

/**
 * Renders a full-screen, centered loading indicator for the quick drug reference.
 *
 * Shows a spinner and the text "Loading quick drug reference..." while content is loading.
 *
 * @returns A JSX element containing a full-screen centered spinner and the loading message.
 */
function LoadingFallback() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <Loader2 className='animate-spin h-8 w-8 text-primary mx-auto' />
        <p className='text-sm text-muted-foreground'>Loading quick drug reference...</p>
      </div>
    </div>
  )
}

interface PageProps {
  searchParams:
    | Promise<{
        weight?: string
        complaint?: string
      }>
    | {
        weight?: string
        complaint?: string
      }
}

/**
 * Server component that renders the quick drug reference page initialized from URL search parameters.
 *
 * The component loads medications and complaint categories on the server and passes them, along with
 * initial UI state, to QuickDrugReferencePage.
 *
 * @param searchParams - Query parameters from the URL. Recognized keys:
 *   - `weight`: parsed as a float to set the initial weight; if missing or invalid, the average weight for a 6-year-old (72 months) is used.
 *   - `complaint`: used as the initial complaint filter; an empty string is treated as undefined.
 * @returns The page element that renders the quick drug reference with server-loaded medications and categories.
 */
export default async function HomePage({ searchParams }: PageProps) {
  // `searchParams` can be a Promise in the App Router — unwrap it first.
  const params = await searchParams

  const parsedWeight = Number.parseFloat(params?.weight ?? '')
  const defaultWeight = (!Number.isNaN(parsedWeight) && parsedWeight > 0 ? parsedWeight : getWeightForAge(72)) ?? 0 // Default to 6 years old, fallback 0 if lookup fails

  const initialComplaintFilter = params?.complaint || undefined // Convert empty string to undefined

  // Fetch data on the server (await in case these return promises)
  const allMedications = await loadMedications()
  const allCategories = await loadComplaintCategories()

  return (
    <Suspense fallback={<LoadingFallback />}>
      <QuickDrugReferencePage
        defaultWeight={defaultWeight}
        initialComplaintFilter={initialComplaintFilter}
        medications={allMedications}
        categories={allCategories}
      />
    </Suspense>
  )
}

export const metadata = {
  title: 'Quick Drug Reference | Doses',
  description:
    'Quick reference for medication dosages with real-time calculations and filtering by complaint categories. Your go-to tool for accurate drug dosing.',
}
