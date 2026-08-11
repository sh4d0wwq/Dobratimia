import { useEffect, useState } from 'react'
import { assetUrl } from '@/lib/assetUrl'
import type { AnatomyModelsManifest, Organ } from './types'

function withAssetBase(manifest: AnatomyModelsManifest): AnatomyModelsManifest {
  const organs: AnatomyModelsManifest['organs'] = {}
  for (const [id, organ] of Object.entries(manifest.organs)) {
    organs[id] = { ...organ, url: assetUrl(organ.url) }
  }
  return {
    ...manifest,
    body: { ...manifest.body, url: assetUrl(manifest.body.url) },
    organs,
  }
}

export function useAnatomyData() {
  const [organs, setOrgans] = useState<Organ[]>([])
  const [manifest, setManifest] = useState<AnatomyModelsManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch(assetUrl('data/anatomy-stress.json')).then((r) => {
        if (!r.ok) throw new Error('Не удалось загрузить тексты органов')
        return r.json() as Promise<{ organs: Organ[] }>
      }),
      fetch(assetUrl('data/anatomy-models.json')).then((r) => {
        if (!r.ok) throw new Error('Не удалось загрузить данные')
        return r.json() as Promise<AnatomyModelsManifest>
      }),
    ])
      .then(([stress, models]) => {
        if (cancelled) return
        setOrgans(stress.organs)
        setManifest(withAssetBase(models))
        setLoading(false)
      })
      .catch((e: Error) => {
        if (cancelled) return
        setError(e.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { organs, manifest, loading, error }
}
