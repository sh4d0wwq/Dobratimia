import { useEffect, useState } from 'react'
import { registerVisit } from '@/lib/visitorCounter'

function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function VisitorCounter({ className = '' }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void registerVisit().then((value) => {
      if (!cancelled) setCount(value)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Пока счётчик недоступен, ничего не выдумываем и не показываем.
  if (count === null || count <= 0) return null

  return (
    <p className={`text-sm text-muted ${className}`}>
      🤝 Сегодня вы не одни: сайт посетили{' '}
      <b className="tabular-nums text-primary-dark">{count}</b>{' '}
      {plural(count, 'человек', 'человека', 'человек')}
    </p>
  )
}
