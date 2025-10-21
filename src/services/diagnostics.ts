import { API_BASE_URL } from '../config/api'

export type DuplicateType = 'catalog' | 'gtin'

export interface DuplicateGroup {
  _id: string
  count: number
  ids: string[]
  suggested_canonical?: string
}

export interface DuplicatesSummary {
  groups_catalog: number
  groups_gtin: number
  excess_catalog: number
  excess_gtin: number
  sample_catalog: DuplicateGroup[]
  sample_gtin: DuplicateGroup[]
}

export interface DuplicatesFullResponse {
  duplicates: {
    by_catalog_product_id: DuplicateGroup[]
    by_gtin: DuplicateGroup[]
  }
  products?: Array<Record<string, any>>
  summary?: DuplicatesSummary
}

export async function fetchDuplicates(options?: {
  limit?: number
  summary?: boolean
  includeProducts?: boolean
  type?: DuplicateType
  fields?: string
}): Promise<DuplicatesFullResponse> {
  const params = new URLSearchParams()
  if (options?.limit) params.set('limit', String(options.limit))
  if (options?.summary) params.set('summary', 'true')
  if (options?.includeProducts) params.set('includeProducts', 'true')
  if (options?.type) params.set('type', options.type)
  if (options?.fields) params.set('fields', options.fields)

  const url = `${API_BASE_URL}/ml/diagnostics/duplicates${params.toString() ? `?${params.toString()}` : ''}`
  const res = await fetch(url)
  if (!res.ok) {
    let msg = 'Error consultando duplicados'
    try { const j = await res.json(); msg = j?.error || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export interface CensusResponse {
  ml_counts_by_status: Record<string, number>
  ml_total_estimated: number
  db_total: number
  db_by_status: Array<{ _id: string, count: number }>
  gap_estimated: number
}

export async function fetchCensus(): Promise<CensusResponse> {
  const url = `${API_BASE_URL}/ml/sync/census`
  const res = await fetch(url)
  if (!res.ok) {
    let msg = 'Error consultando censo'
    try { const j = await res.json(); msg = j?.error || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}


