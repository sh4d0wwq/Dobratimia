import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { playScreamReleaseSound } from '@/hooks/useScreamReleaseSound'
import { ScreamParticles } from './ScreamParticles'
import { useScreamParticles } from './useScreamParticles'

export function TextReleasePanel() {
  const { showToast } = useToast()
  const { particles, burst } = useScreamParticles()
  const [text, setText] = useState('')
  const [released, setReleased] = useState(false)

  const release = async () => {
    if (!text.trim()) {
      showToast('✏️ Напишите что-нибудь, затем нажмите «Отпустить»')
      return
    }
    await playScreamReleaseSound()
    burst()
    window.setTimeout(() => setReleased(true), 1400)
  }

  if (released) {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <span className="text-6xl">✨</span>
        <p className="mt-4 text-2xl font-semibold text-primary">Отпущено. Стало легче?</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/dass">
            <Button variant="secondary">📋 Пройти DASS-21</Button>
          </Link>
          <Link to="/meditation?mode=0">
            <Button variant="secondary">🧘 Подышать</Button>
          </Link>
          <Link to="/techniques">
            <Button variant="secondary">💡 Техники</Button>
          </Link>
        </div>
        <Button
          className="mt-6"
          onClick={() => {
            setText('')
            setReleased(false)
          }}
        >
          🔄 Ещё раз
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <ScreamParticles particles={particles} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Всё, что беспокоит, злит, расстраивает…"
        className="w-full resize-y rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-lg focus:border-danger focus:ring-2 focus:ring-red-200 focus:outline-none"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setText('')} disabled={!text}>
          Очистить
        </Button>
        <Button variant="danger" onClick={() => void release()} className="min-w-[8.5rem]">
          💥 Отпустить
        </Button>
      </div>
      <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-sm text-primary-dark">
        🔒 Текст никуда не сохраняется — только на вашем устройстве до «Отпустить».
      </p>
    </div>
  )
}
