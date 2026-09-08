import { useState } from 'react'
import { Link } from 'react-router-dom'
import { findTherapist, initialsOf } from '@/data/therapists'

/**
 * Отметка «От психотерапевта»: заметная, но компактная. По нажатию
 * открывается карточка с информацией об авторе слова.
 */
export function ExpertBadge({ therapistId }: { therapistId: string }) {
  const [open, setOpen] = useState(false)
  const therapist = findTherapist(therapistId)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-200"
      >
        <span aria-hidden>🩺</span>
        От психотерапевта
        <span aria-hidden className="text-violet-400">
          ⓘ
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="animate-fade-in relative w-full max-w-sm rounded-2xl bg-white p-5 text-left shadow-xl">
            <p className="text-sm font-semibold text-violet-700">
              🩺 Это доброе слово подготовлено психотерапевтом
            </p>

            {therapist ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 font-bold text-white">
                    {initialsOf(therapist.name)}
                  </span>
                  <div>
                    <p className="font-semibold">{therapist.name}</p>
                    <p className="text-xs text-muted">{therapist.specializations.join(' · ')}</p>
                  </div>
                </div>

                <Link
                  to={`/therapists?id=${therapist.id}`}
                  className="mt-4 inline-block text-sm font-medium text-primary-dark underline"
                  onClick={() => setOpen(false)}
                >
                  Открыть профиль специалиста →
                </Link>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">Автор слова — специалист платформы.</p>
            )}

            <p className="mt-4 rounded-xl bg-slate-100 p-3 text-xs text-muted">
              Это общее поддерживающее высказывание, а не индивидуальная консультация и не
              назначение лечения.
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-xl bg-slate-200 py-2.5 text-sm font-semibold transition hover:bg-slate-300"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  )
}
