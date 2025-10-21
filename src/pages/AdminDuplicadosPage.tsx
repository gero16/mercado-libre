import React, { useEffect, useMemo, useState } from 'react'
import { fetchDuplicates, DuplicateGroup, DuplicatesFullResponse, fetchCensus, CensusResponse } from '../services/diagnostics'
import '../css/admin-duplicates.css'

function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fn().then(d => { if (active) setData(d) }).catch(e => { if (active) setError(e?.message || 'Error') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { data, loading, error }
}

export default function AdminDuplicadosPage() {
  const [limit, setLimit] = useState<number>(20)
  const [type, setType] = useState<'catalog' | 'gtin' | 'both'>('catalog')
  const [includeProducts, setIncludeProducts] = useState<boolean>(true)
  const [onlyActive, setOnlyActive] = useState<boolean>(false)

  const query = useMemo(() => {
    const t = type === 'both' ? undefined : (type as any)
    return () => fetchDuplicates({ limit, includeProducts, type: t, fields: 'ml_id,title,status,price,available_quantity,sold_quantity,listing_type_id,health,permalink,images,es_catalogo,catalog_product_id,tags' })
  }, [limit, includeProducts, type])

  const { data, loading, error } = useAsync<DuplicatesFullResponse>(query, [query])
  const censusReq = useAsync<CensusResponse>(() => fetchCensus(), [])
  const summaryReq = useAsync<DuplicatesFullResponse>(() => fetchDuplicates({ type: 'catalog', limit: 1000, summary: true }), [])

  // Derivar métricas detalladas
  const computed = useMemo(() => {
    const products = data?.products || []
    const prodById = new Map(products.map(p => [p.ml_id, p]))
    const groupsCat = data?.duplicates?.by_catalog_product_id || []
    const groupsGtin = data?.duplicates?.by_gtin || []
    const catGroupsCount = groupsCat.length
    const catItemsInGroups = groupsCat.reduce((acc, g) => acc + (Number(g.count) || 0), 0)

    function groupActiveExcess(groups: DuplicateGroup[]) {
      let activeGroups = 0
      let activeExcess = 0
      for (const g of groups) {
        const ids = g.ids || []
        const active = ids.filter(id => (prodById.get(id)?.status) === 'active').length
        if (active > 1) {
          activeGroups += 1
          activeExcess += (active - 1)
        }
      }
      return { activeGroups, activeExcess }
    }

    const catActive = groupActiveExcess(groupsCat)
    const gtinActive = groupActiveExcess(groupsGtin)
    const isCatalog = (p: any) => !!(p?.es_catalogo || p?.catalog_product_id || (Array.isArray(p?.tags) && p.tags.includes('catalog_listing')))
    const catalogCount = products.filter(isCatalog).length
    const traditionalCount = products.length - catalogCount
    return {
      groupsCat,
      groupsGtin,
      catGroupsCount,
      catItemsInGroups,
      catActive,
      gtinActive,
      products,
      catalogCount,
      traditionalCount
    }
  }, [data])

  const groupsCatalog = data?.duplicates?.by_catalog_product_id || []
  const groupsGtin = data?.duplicates?.by_gtin || []

  const ProductCell: React.FC<{ id: string }> = ({ id }) => {
    const p = (data?.products || []).find(x => x.ml_id === id)
    const img = p?.images && Array.isArray(p.images) && p.images.length > 0 ? (p.images[0].url || '') : ''
    const tipoCatalogo = p?.es_catalogo ? 'Catálogo' : 'Tradicional'
    const listingLabel = (() => {
      const lt = (p?.listing_type_id || '').toString().toLowerCase()
      if (lt.includes('gold_premium') || lt.includes('gold_pro')) return 'Premium'
      if (lt.includes('gold_special')) return 'Clásica'
      if (lt === 'free') return 'Gratuita'
      return p?.listing_type_id || '-'
    })()
    return (
      <div className="dup-product">
        {img && (
          <div style={{ marginBottom: 8 }}>
            <a href={p?.permalink || `https://mercadolibre.com/item/${id}`} target="_blank" rel="noreferrer">
              <img src={img} alt={p?.title || id} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            </a>
          </div>
        )}
        <div className="dup-title"><a href={p?.permalink || `https://mercadolibre.com/item/${id}`} target="_blank" rel="noreferrer">{p?.title || id}</a></div>
        <div className="dup-meta" style={{ marginTop: 6 }}>
          <span className="badge" title={p?.catalog_product_id ? `Catálogo: ${p.catalog_product_id}` : ''}>{tipoCatalogo}</span>
          <span className="badge type">{listingLabel}</span>
          <span className="badge" title="MLU / ID de publicación">{p?.ml_id || id}</span>
        </div>
        <div className="dup-meta">
          <span>Status: {p?.status || '-'}</span>
          <span>Sold: {p?.sold_quantity ?? '-'}</span>
          <span>Health: {p?.health ?? '-'}</span>
          <span>Price: {p?.price ?? '-'}</span>
          <span>Stock: {p?.available_quantity ?? '-'}</span>
        </div>
      </div>
    )
  }

  const GroupCard: React.FC<{ title: string; group: DuplicateGroup }> = ({ title, group }) => {
    const [open, setOpen] = useState<boolean>(true)
    const dupExcess = Math.max(0, (group.count || 0) - 1)
    const copyIds = () => navigator.clipboard?.writeText((group.ids || []).join(','))
    return (
      <div className="dup-card">
        <div className="dup-header">
          <div>
            <div className="dup-id">{title}: {group._id}</div>
            <div className="dup-badges">
              <span className="badge type">Grupo {title}</span>
              <span className="badge">Total: {group.count}</span>
              {dupExcess > 0 && <span className="badge dup">Duplicados: {dupExcess}</span>}
            </div>
          </div>
          <div className="dup-actions">
            {group.suggested_canonical && <span className="dup-suggest">Canónica: {group.suggested_canonical}</span>}
            <button className="btn" onClick={() => copyIds()}>Copiar IDs</button>
            <button className="btn btn-ghost" onClick={() => setOpen(o => !o)}>{open ? 'Colapsar' : 'Expandir'}</button>
          </div>
        </div>
        {open && (
          <div className="dup-list">
            {(group.ids || []).map(id => (
              <ProductCell key={id} id={id} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="admin-page admin-duplicates">
      <h1>Duplicados</h1>

      <div className="dup-filters" style={{ justifyContent: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Tipo:&nbsp;
            <select value={type} onChange={e => setType(e.target.value as any)}>
              <option value="catalog">Catálogo</option>
              <option value="gtin">GTIN/EAN</option>
              <option value="both">Ambos</option>
            </select>
          </label>
          <label>Límite:&nbsp;
            <input type="number" min={5} max={500} step={5} value={limit} onChange={e => setLimit(parseInt(e.target.value || '20'))} />
          </label>
          <label>
            <input type="checkbox" checked={includeProducts} onChange={e => setIncludeProducts(e.target.checked)} /> Incluir detalles
          </label>
          <label>
            <input type="checkbox" checked={onlyActive} onChange={e => setOnlyActive(e.target.checked)} /> Solo activos
          </label>
        </div>
      </div>

      <div className="dup-kpis">
        <div className="kpi-card kpi-primary">
          <div className="kpi-label">ML activos</div>
          <div className="kpi-value">{censusReq.data?.ml_counts_by_status?.active ?? '-'}</div>
        </div>
        <div className="kpi-card kpi-neutral">
          <div className="kpi-label">ML total estimado</div>
          <div className="kpi-value">{censusReq.data?.ml_total_estimated ?? '-'}</div>
        </div>
        <div className="kpi-card kpi-neutral">
          <div className="kpi-label">DB total</div>
          <div className="kpi-value">{censusReq.data?.db_total ?? '-'}</div>
        </div>
        {(() => {
          const dbTotal = censusReq.data?.db_total
          const excessDB = summaryReq.data?.summary?.excess_catalog
          const uniquesDB = (typeof dbTotal === 'number' && typeof excessDB === 'number') ? Math.max(0, dbTotal - excessDB) : undefined
          const pctDB = (typeof dbTotal === 'number' && dbTotal > 0 && typeof excessDB === 'number') ? `${Math.round((excessDB / dbTotal) * 1000) / 10}%` : '-'
          return (
            <>
              <div className="kpi-card kpi-danger">
                <div className="kpi-label" title="Exceso: suma de (count - 1) por grupo. Se descuenta dejando 1 canónica por grupo.">Duplicados DB (exceso catálogo)</div>
                <div className="kpi-value">{excessDB ?? '-'}</div>
              </div>
              <div className="kpi-card kpi-success">
                <div className="kpi-label">Únicos DB</div>
                <div className="kpi-value">{uniquesDB ?? '-'}</div>
              </div>
              <div className="kpi-card kpi-warning">
                <div className="kpi-label">% duplicados DB</div>
                <div className="kpi-value">{pctDB}</div>
              </div>
              <div className="kpi-card kpi-neutral">
                <div className="kpi-label" title="Cantidad de grupos que tienen más de una publicación del mismo catálogo">Grupos duplicados DB</div>
                <div className="kpi-value">{computed.catGroupsCount}</div>
              </div>
              <div className="kpi-card kpi-neutral">
                <div className="kpi-label" title="Suma de publicaciones que pertenecen a grupos duplicados (incluye canónicas y duplicadas)">Publicaciones en grupos</div>
                <div className="kpi-value">{computed.catItemsInGroups}</div>
              </div>
            </>
          )
        })()}
        {includeProducts && (() => {
          const activeML = censusReq.data?.ml_counts_by_status?.active
          const excessActive = computed.catActive.activeExcess
          const uniquesActive = (typeof activeML === 'number') ? Math.max(0, activeML - excessActive) : undefined
          const pctActive = (typeof activeML === 'number' && activeML > 0) ? `${Math.round((excessActive / activeML) * 1000) / 10}%` : '-'
          return (
            <>
              <div className="kpi-card kpi-danger">
                <div className="kpi-label">Duplicados activos (catálogo)</div>
                <div className="kpi-value">{excessActive}</div>
              </div>
              <div className="kpi-card kpi-success">
                <div className="kpi-label">Únicos activos</div>
                <div className="kpi-value">{uniquesActive ?? '-'}</div>
              </div>
              <div className="kpi-card kpi-warning">
                <div className="kpi-label">% duplicados activos</div>
                <div className="kpi-value">{pctActive}</div>
              </div>
            </>
          )
        })()}
      </div>

      {loading && <div>Cargando...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="dup-sections">
          {(type === 'catalog' || type === 'both') && (
            <section>
              <h2>Por catálogo</h2>
              {groupsCatalog.length === 0 && <div>No hay duplicados por catálogo</div>}
              {(onlyActive
                ? groupsCatalog.filter(g => (g.ids || []).filter(id => (computed.products.find(p => p.ml_id === id)?.status) === 'active').length > 1)
                : groupsCatalog
              ).map(g => (
                <GroupCard key={`cat-${g._id}`} title="CAT" group={g} />
              ))}
            </section>
          )}

          {(type === 'gtin' || type === 'both') && (
            <section>
              <h2>Por GTIN/EAN</h2>
              {groupsGtin.length === 0 && <div>No hay duplicados por GTIN/EAN</div>}
              {(onlyActive
                ? groupsGtin.filter(g => (g.ids || []).filter(id => (computed.products.find(p => p.ml_id === id)?.status) === 'active').length > 1)
                : groupsGtin
              ).map(g => (
                <GroupCard key={`gtin-${g._id}`} title="GTIN" group={g} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
