import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoudnessMeterPanel } from './LoudnessMeterPanel'
import { LOUDNESS_REACTIONS } from './loudnessReactions'
import { TextReleasePanel } from './TextReleasePanel'

type Tab = 'voice' | 'text'

const TABS: { id: Tab; label: string }[] = [
  { id: 'voice', label: '🎤 Замер крика' },
  { id: 'text', label: '✍️ Текстом' },
]

export function ScreamPage() {
  const [tab, setTab] = useState<Tab>('voice')

  return (
    <div className="relative pb-28 lg:pb-8">
      <PageHeader
        title="🔥 Крик"
        subtitle="Анонимное пространство для эмоций: крикните в микрофон и посмотрите, насколько громко у вас получилось."
      />

      <div className="mb-6 flex justify-center gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-5 py-2 font-medium transition ${
              tab === item.id ? 'bg-danger text-white' : 'bg-slate-200 text-text hover:bg-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'voice' ? <LoudnessMeterPanel /> : <TextReleasePanel />}

      {tab === 'voice' && (
        <>
          <p className="mx-auto mt-8 max-w-xl rounded-xl bg-emerald-50 p-4 text-center text-sm text-primary-dark">
            🔒 Мы не записываем и не сохраняем ваш голос — анализируется только уровень громкости.
          </p>

          <details className="mx-auto mt-4 max-w-xl rounded-xl bg-white p-4 text-sm shadow-md">
            <summary className="cursor-pointer font-semibold">Шкала и её точность</summary>
            <p className="mt-3 text-muted">
              Уровень показан в <b>условных дБ</b>: браузерный микрофон не даёт калиброванного
              значения — результат зависит от устройства, расстояния и настроек усиления. Это игровой
              ориентир, а не измерительный прибор.
            </p>
            <ul className="mt-3 space-y-1">
              {LOUDNESS_REACTIONS.map((r) => (
                <li key={r.min} className="flex gap-2">
                  <span className="w-20 shrink-0 tabular-nums text-muted">
                    {r.max === null ? `${r.min}+` : `${r.min}–${r.max}`}
                  </span>
                  <span>
                    {r.emoji} {r.title}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  )
}
