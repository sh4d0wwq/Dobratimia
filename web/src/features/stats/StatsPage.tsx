import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { findTherapist } from '@/data/therapists'
import { clearTherapistEvents, computeTherapistMetrics } from '@/lib/therapistAnalytics'
import { fetchRecentCounts } from '@/lib/visitorCounter'

type Row = { date: Date; count: number | null }

const RANGES = [7, 30] as const

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

function sum(rows: Row[]): number {
  return rows.reduce((acc, row) => acc + (row.count ?? 0), 0)
}

/**
 * Служебная страница статистики посещений (нет в навигации).
 * Данные берутся из того же публичного счётчика, что и на главной.
 */
export function StatsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(7)
  const [loaded, setLoaded] = useState<{ range: number; rows: Row[] } | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchRecentCounts(range).then((rows) => {
      if (!cancelled) setLoaded({ range, rows })
    })
    return () => {
      cancelled = true
    }
  }, [range])

  const loading = loaded?.range !== range
  const rows = loading ? [] : (loaded?.rows ?? [])

  const today = rows[0]?.count ?? null
  const yesterday = rows[1]?.count ?? null
  const max = Math.max(1, ...rows.map((r) => r.count ?? 0))

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="📈 Посещения" subtitle="Практический счётчик, а не точная статистика" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Сегодня', value: today },
          { label: 'Вчера', value: yesterday },
          { label: `За ${range} дней`, value: rows.length ? sum(rows) : null },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-4 text-center shadow-md">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{item.value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        {RANGES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRange(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              range === value ? 'bg-primary text-white' : 'bg-slate-200 hover:bg-slate-300'
            }`}
          >
            {value} дней
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-md">
        {loading ? (
          <p className="py-6 text-center text-muted">Загружаем данные…</p>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((row) => (
              <li key={row.date.toISOString()} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 text-muted">{formatDate(row.date)}</span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${((row.count ?? 0) / max) * 100}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right tabular-nums">{row.count ?? '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-muted">
        Посещение учитывается один раз за сессию браузера, известные боты и автоматические запросы
        отфильтровываются по мере возможности. Персональные данные и IP-адреса не сохраняются.
      </p>

      <TherapistMetricsTable />
    </div>
  )
}

function percent(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`
}

/** Аналитика по карточкам специалистов: пока считается на устройстве. */
function TherapistMetricsTable() {
  const [metrics, setMetrics] = useState(() => computeTherapistMetrics())

  if (metrics.length === 0) {
    return (
      <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-muted shadow-md">
        Пока нет данных по карточкам специалистов. Они появятся после просмотров в разделе
        «Специалисты».
      </p>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">🤝 Карточки специалистов</h3>
        <button
          type="button"
          onClick={() => {
            clearTherapistEvents()
            setMetrics([])
          }}
          className="text-xs text-muted underline"
        >
          Очистить
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {metrics.map((row) => (
          <div key={row.therapistId} className="rounded-2xl bg-white p-4 shadow-md">
            <p className="font-medium">
              {findTherapist(row.therapistId)?.name ?? row.therapistId}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted sm:grid-cols-3">
              <span>Показы: {row.shows}</span>
              <span>Интересно: {row.likes}</span>
              <span>Пропуски: {row.skips}</span>
              <span>Доля «интересно»: {percent(row.likeRate)}</span>
              <span>Показ → профиль: {percent(row.detailsRate)}</span>
              <span>Профиль → контакт: {percent(row.contactRate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
