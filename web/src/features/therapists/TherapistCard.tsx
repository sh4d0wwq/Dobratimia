import { useRef, useState } from 'react'
import { FORMAT_LABELS, initialsOf, type Therapist } from '@/data/therapists'
import { assetUrl } from '@/lib/assetUrl'

const SWIPE_THRESHOLD = 110

type Decision = 'like' | 'skip'

/** Карточка специалиста: перетаскивание мышью и свайп пальцем. */
export function TherapistCard({
  therapist,
  onDecision,
  onDetails,
}: {
  therapist: Therapist
  onDecision: (decision: Decision) => void
  onDetails: () => void
}) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState<Decision | null>(null)
  const startXRef = useRef<number | null>(null)

  const finish = (decision: Decision) => {
    setLeaving(decision)
    window.setTimeout(() => onDecision(decision), 260)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (leaving) return
    startXRef.current = e.clientX
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (startXRef.current === null || leaving) return
    setDx(e.clientX - startXRef.current)
  }

  const onPointerUp = () => {
    if (startXRef.current === null) return
    startXRef.current = null
    setDragging(false)
    if (dx > SWIPE_THRESHOLD) finish('like')
    else if (dx < -SWIPE_THRESHOLD) finish('skip')
    setDx(0)
  }

  const offset = leaving ? (leaving === 'like' ? window.innerWidth : -window.innerWidth) : dx
  const hint = dx > 40 ? 'like' : dx < -40 ? 'skip' : null

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      style={{
        transform: `translateX(${offset}px) rotate(${offset / 28}deg)`,
        transition: dragging ? 'none' : 'transform 0.26s ease-out, opacity 0.26s ease-out',
        opacity: leaving ? 0 : 1,
      }}
      className="relative touch-pan-y select-none rounded-3xl bg-white p-6 shadow-xl"
    >
      {hint && (
        <span
          className={`absolute top-5 rounded-xl border-2 px-3 py-1 text-sm font-bold ${
            hint === 'like'
              ? 'left-5 rotate-[-12deg] border-primary text-primary'
              : 'right-5 rotate-[12deg] border-danger text-danger'
          }`}
        >
          {hint === 'like' ? 'Интересно' : 'Не подходит'}
        </span>
      )}

      <div className="flex flex-col items-center text-center">
        {therapist.photo ? (
          <img
            src={assetUrl(therapist.photo)}
            alt={therapist.name}
            className="h-28 w-28 rounded-full object-cover shadow-md"
            draggable={false}
          />
        ) : (
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-3xl font-bold text-white shadow-md">
            {initialsOf(therapist.name)}
          </span>
        )}

        <h3 className="mt-4 text-xl font-bold">{therapist.name}</h3>
        <p className="mt-1 text-sm text-muted">{therapist.specializations.join(' · ')}</p>

        <p className="mt-4 text-sm italic leading-relaxed text-text">«{therapist.quote}»</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted">
          {therapist.experienceYears !== undefined && (
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Опыт {therapist.experienceYears} лет
            </span>
          )}
          {therapist.formats.map((format) => (
            <span key={format} className="rounded-full bg-slate-100 px-3 py-1">
              {FORMAT_LABELS[format]}
            </span>
          ))}
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {therapist.languages.join(', ')}
          </span>
          {therapist.price && (
            <span className="rounded-full bg-slate-100 px-3 py-1">{therapist.price}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onDetails}
          className="mt-5 text-sm font-semibold text-primary-dark underline"
        >
          Подробнее
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => finish('skip')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl transition hover:bg-slate-200"
          aria-label="Не подходит"
        >
          ✖️
        </button>
        <button
          type="button"
          onClick={() => finish('like')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
          aria-label="Интересно"
        >
          💚
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        Свайп влево — пропустить, вправо — узнать больше
      </p>
    </div>
  )
}
