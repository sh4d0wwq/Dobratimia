import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { findTherapist, visibleTherapists, type Therapist } from '@/data/therapists'
import { trackTherapistEvent } from '@/lib/therapistAnalytics'
import { TherapistCard } from './TherapistCard'
import { TherapistDetails } from './TherapistDetails'
import { loadFavorites, toggleFavorite } from './favorites'

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function TherapistsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedId = searchParams.get('id')

  // Порядок фиксируется на сессию просмотра: один специалист — один показ.
  const [deck, setDeck] = useState<Therapist[]>(() => shuffled(visibleTherapists()))
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>(loadFavorites)
  const [detailsId, setDetailsId] = useState<string | null>(requestedId)

  const current = deck[index] ?? null
  const details = useMemo(() => (detailsId ? findTherapist(detailsId) : undefined), [detailsId])

  useEffect(() => {
    if (current) trackTherapistEvent('card_shown', current.id)
  }, [current])

  useEffect(() => {
    if (details) trackTherapistEvent('details_opened', details.id)
  }, [details])

  const closeDetails = () => {
    setDetailsId(null)
    if (requestedId) {
      searchParams.delete('id')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const handleDecision = (decision: 'like' | 'skip') => {
    if (!current) return
    trackTherapistEvent(decision === 'like' ? 'swipe_right' : 'swipe_left', current.id)
    if (decision === 'like') {
      setLiked((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]))
      setDetailsId(current.id)
    }
    setIndex((i) => i + 1)
  }

  const restart = () => {
    setDeck(shuffled(visibleTherapists()))
    setIndex(0)
  }

  const handleToggleFavorite = (id: string) => {
    const next = toggleFavorite(id)
    setFavorites(next)
    if (next.includes(id)) trackTherapistEvent('favorite_added', id)
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="🤝 Подобрать специалиста"
        subtitle="Листайте карточки: влево — не подходит, вправо — хочу узнать больше."
      />

      {current ? (
        <>
          <TherapistCard
            key={current.id}
            therapist={current}
            onDecision={handleDecision}
            onDetails={() => setDetailsId(current.id)}
          />
          <p className="mt-4 text-center text-sm text-muted">
            Карточка {index + 1} из {deck.length}
            {liked.length > 0 && ` · отмечено: ${liked.length}`}
          </p>
        </>
      ) : (
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
          <span className="text-5xl">🌾</span>
          <p className="mt-4 text-lg font-semibold">Вы посмотрели всех специалистов</p>
          <p className="mt-2 text-sm text-muted">
            {liked.length > 0
              ? `Вам показались интересными: ${liked.length}. Открыть их можно из избранного ниже.`
              : 'Можно пройтись по списку заново — порядок будет другим.'}
          </p>
          <Button className="mt-6" onClick={restart}>
            🔄 Начать заново
          </Button>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-md">
          <h3 className="text-sm font-semibold">★ Избранное</h3>
          <ul className="mt-3 space-y-2">
            {favorites.map((id) => {
              const therapist = findTherapist(id)
              if (!therapist) return null
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setDetailsId(id)}
                    className="text-sm font-medium text-primary-dark hover:underline"
                  >
                    {therapist.name} — {therapist.specializations[0]}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <p className="mt-6 rounded-xl bg-slate-100 p-4 text-xs text-muted">
        Контакты специалистов публикуются только с их согласия и открываются после вашего
        подтверждения. Профиль можно скрыть или удалить по запросу специалиста.
      </p>

      {details && (
        <TherapistDetails
          therapist={details}
          isFavorite={favorites.includes(details.id)}
          onToggleFavorite={() => handleToggleFavorite(details.id)}
          onClose={closeDetails}
        />
      )}
    </div>
  )
}
