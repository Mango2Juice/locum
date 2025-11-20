// src/app/drug/[drugId]/page.tsx

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { AlertCircle, TriangleAlert } from 'lucide-react'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote-client/rsc'
import { getFrontmatter } from 'next-mdx-remote-client/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { findMedicationById } from '@/lib/quick-reference-database/filtering'
import { medications as allDrugData } from '@/lib/quick-reference-database/medications'
import { Callout } from '@/mdx-components'

interface DrugPageProps {
  params: Promise<{
    drugId: string
  }>
}

type MdxFrontmatter = {
  title?: string
  description?: string
  aliases?: string | string[]
}

/**
 * Read and parse the MDX file for a given base drug identifier.
 *
 * @param baseDrugId - The base identifier used to locate `{baseDrugId}.mdx` in the quick-reference medications directory.
 * @returns An object with `content` (the MDX body) and `frontmatter` (the parsed frontmatter data), or `null` if the file does not exist or cannot be read.
 */
async function getMdxContent(baseDrugId: string) {
  try {
    const mdxDirectory = path.join(process.cwd(), 'src/lib/quick-reference-database/medications-full/')
    const filePath = path.join(mdxDirectory, `${baseDrugId}.mdx`)
    const source = await fs.readFile(filePath, 'utf-8')
    const { frontmatter, strippedSource } = getFrontmatter<MdxFrontmatter>(source)
    return { content: strippedSource, frontmatter }
  } catch (error) {
    // File not found is an expected outcome if no detailed page exists.
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null
    }
    // For other errors, we can choose to log them but still return null.
    console.error(`Failed to read MDX file for ${baseDrugId}:`, error)
    return null
  }
}

/**
 * Retrieve quick-reference data and associated MDX content for a given drug ID.
 *
 * Returns `null` if the `drugId` is invalid, the quick-reference entry is missing, or the MDX content cannot be found.
 *
 * @param drugId - The drug identifier from the route (e.g., "aspirin-quick" or "aspirin")
 * @returns `{ quickRefDrug, mdxData }` when both the quick reference entry and MDX content are available, `null` otherwise.
 */
async function getDrugPageData(drugId: string) {
  if (typeof drugId !== 'string') {
    console.error('[getDrugPageData] FAILED: drugId parameter is missing or not a string.')
    return null
  }

  // The lookup ID for the quick reference data array
  const lookupId = `${drugId.replace(/-quick$/, '')}-quick`
  const quickRefDrug = findMedicationById(allDrugData, lookupId)

  // Use mainDatabaseId for MDX lookup if it exists, otherwise derive from the URL drugId
  const baseDrugId = quickRefDrug?.mainDatabaseId || drugId.replace(/-quick$/, '')

  // If baseDrugId is not available, we can't fetch MDX content.
  if (!baseDrugId) {
    return null
  }

  const mdxData = await getMdxContent(baseDrugId)

  // The drug page is only valid if both the quick reference entry AND the MDX file exist.
  if (!quickRefDrug || !mdxData) {
    return null
  }

  return { quickRefDrug, mdxData }
}

/**
 * Build page metadata for a drug using MDX frontmatter when available and falling back to quick-reference data.
 *
 * @param props - Route props whose `params` resolve to an object containing the `drugId` string used to locate quick-reference and MDX data
 * @returns An object with `title` and `description` strings. `title` uses the MDX frontmatter `title` when present or the quick-reference drug name otherwise; if the drug or MDX data is missing, `title` is `"Drug Not Found"`. `description` uses the MDX frontmatter `description` when present or a sensible default describing the drug.
 */
export async function generateMetadata({ params }: DrugPageProps) {
  const { drugId } = await params
  const data = await getDrugPageData(drugId)

  if (!data) {
    return {
      title: 'Drug Not Found',
      description: 'The requested medication could not be found.',
    }
  }

  const { quickRefDrug, mdxData } = data
  const title = mdxData.frontmatter?.title || quickRefDrug.name
  const description = mdxData.frontmatter?.description || `Detailed clinical and safety notes for ${quickRefDrug.name}.`

  return {
    title: `${title} | Drug Information`,
    description,
  }
}

/**
 * Render the drug detail page showing MDX-driven content for a specific drug.
 *
 * @param props - Route props containing `params.drugId`, the identifier of the drug to load
 * @returns The React element for the drug detail page. If the drug or its MDX content cannot be found, triggers a 404 via `notFound()`.
 */
export default async function DrugPage({ params }: Readonly<DrugPageProps>) {
  const { drugId } = await params
  const data = await getDrugPageData(drugId)

  // If no data is returned (either drug not found or MDX file missing), show a 404 page.
  if (!data) {
    notFound()
  }

  const { content, frontmatter } = data.mdxData
  const components = {
    Callout,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Alert,
    AlertTitle,
    AlertDescription,
    AlertCircle,
    TriangleAlert,
  }

  const aliasesRaw = frontmatter?.aliases
  let aliases: string | undefined
  if (Array.isArray(aliasesRaw)) {
    aliases = aliasesRaw.join(', ')
  } else if (typeof aliasesRaw === 'string') {
    aliases = aliasesRaw
  } else {
    aliases = undefined
  }

  return (
    <div className='w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24'>
      <article className='prose dark:prose-invert lg:prose-lg'>
        <h1>{frontmatter?.title || data.quickRefDrug.name}</h1>
        {aliases && <p className='text-muted-foreground italic'>Also known as: {aliases}</p>}
        <MDXRemote source={content} components={components} />
      </article>
    </div>
  )
}
