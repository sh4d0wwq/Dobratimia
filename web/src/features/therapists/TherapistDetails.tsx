import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { FORMAT_LABELS, initialsOf, type Therapist } from '@/data/therapists'
import { assetUrl } from '@/lib/assetUrl'
import { trackTherapistEvent } from '@/lib/therapistAnalytics'

/** Подробная карточка специалиста с контактами. */
export function TherapistDetails({
  therapist,
  isFavorite,
  onToggleFavorite,
  onClose,
}: {
  therapist: Therapist
  isFavorite: boolean
  onToggleFavorite: () => void
  onClose: () => void
}) {
  // Контакты открываются только после подтверждения действия пользователем.
  const [contactsVisible, setContactsVisible] = useState(false)

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="animate-fade-in scrollbar-subtle relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start gap-4">
          {therapist.photo ? (
            <img
              src={assetUrl(therapist.photo)}
              alt={therapist.name}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-bold text-white">
              {initialsOf(therapist.name)}
            </span>
          )}
          <div>
            <h3 className="text-xl font-bold">{therapist.name}</h3>
            <p className="mt-1 text-sm text-muted">{therapist.specializations.join(' · ')}</p>
            {therapist.experienceYears !== undefined && (
              <p className="mt-1 text-sm text-muted">Опыт: {therapist.experienceYears} лет</p>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm italic text-muted">«{therapist.quote}»</p>
        <p className="mt-4 text-sm leading-relaxed">{therapist.description}</p>

        <dl className="mt-5 space-y-2 text-sm">
          {therapist.approach && therapist.approach.length > 0 && (
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 text-muted">Подход</dt>
              <dd>{therapist.approach.join(', ')}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-32 shrink-0 text-muted">Формат</dt>
            <dd>{therapist.formats.map((f) => FORMAT_LABELS[f]).join(', ')}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-32 shrink-0 text-muted">Язык</dt>
            <dd>{therapist.languages.join(', ')}</dd>
          </div>
          {therapist.price && (
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 text-muted">Стоимость</dt>
              <dd>{therapist.price}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6">
          {!therapist.contactsAllowed || therapist.contacts.length === 0 ? (
            <p className="rounded-xl bg-slate-100 p-3 text-sm text-muted">
              Специалист пока не открыл контакты для публикации. Напишите нам через форму обратной
              связи — поможем подобрать вариант.
            </p>
          ) : contactsVisible ? (
            <div className="space-y-2">
              {therapist.contacts.map((contact) => (
                <a
                  key={contact.href}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  onClick={() =>
                    trackTherapistEvent(
                      contact.kind === 'booking' ? 'booking_clicked' : 'contact_clicked',
                      therapist.id,
                    )
                  }
                  className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-primary-dark transition hover:bg-emerald-100"
                >
                  <span>{contact.label}</span>
                  <span>{contact.value}</span>
                </a>
              ))}
            </div>
          ) : (
            <Button className="w-full" onClick={() => setContactsVisible(true)}>
              📞 Связаться со специалистом
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onClose}>
            ← Вернуться к просмотру
          </Button>
          <Button variant="secondary" onClick={onToggleFavorite}>
            {isFavorite ? '★ В избранном' : '☆ Сохранить в избранное'}
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted">
          Платформа не гарантирует результат терапии и не даёт медицинских обещаний. Выбор
          специалиста остаётся за вами.
        </p>
      </div>
    </div>
  )
}
