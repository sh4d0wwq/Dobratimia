import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoudnessWave } from './LoudnessWave'
import { ScreamParticles } from './ScreamParticles'
import { colorForLevel, reactionForLevel } from './loudnessReactions'
import { MAX_LEVEL, MIC_DENIED_MESSAGE, useLoudnessMeter } from './useLoudnessMeter'
import { useScreamParticles } from './useScreamParticles'

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const mm = Math.floor(total / 60)
  const ss = total % 60
  return `${mm}:${String(ss).padStart(2, '0')}`
}

export function LoudnessMeterPanel() {
  const { status, level, peak, seconds, historyRef, levelRef, start, stop, reset } =
    useLoudnessMeter()
  const { particles, burst } = useScreamParticles()
  const [finalPeak, setFinalPeak] = useState(0)

  const finish = () => {
    const result = stop()
    setFinalPeak(result.peak)
    if (result.peak >= 80) burst()
  }

  const liveReaction = reactionForLevel(level)
  const resultReaction = reactionForLevel(finalPeak)
  const liveRatio = Math.min(1, level / MAX_LEVEL)

  return (
    <div className="mx-auto max-w-xl">
      <ScreamParticles particles={particles} />

      {(status === 'idle' || status === 'requesting') && (
        <div className="flex flex-col items-center py-10">
          <button
            type="button"
            onClick={() => void start()}
            disabled={status === 'requesting'}
            className="relative flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-lg font-bold text-white shadow-xl shadow-red-500/40 transition hover:scale-105 active:scale-95 disabled:opacity-70 sm:h-48 sm:w-48"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400/30" />
            <span className="text-4xl">🎤</span>
            {status === 'requesting' ? 'Запрашиваем…' : 'Начать'}
          </button>
          <p className="mt-6 max-w-sm text-center text-muted">
            Нажмите и кричите, пойте или просто говорите — мы покажем, как менялась громкость.
          </p>
        </div>
      )}

      {status === 'recording' && (
        <div className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-transform duration-100"
                style={{
                  background: colorForLevel(level),
                  transform: `scale(${1 + liveRatio * 0.35})`,
                }}
              >
                🎤
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: colorForLevel(level) }}>
                  {Math.round(level)}
                  <span className="ml-1 text-sm font-medium text-muted">усл. дБ</span>
                </p>
                <p className="text-sm text-muted">
                  {liveReaction.emoji} {liveReaction.title}
                </p>
              </div>
            </div>
            <p className="text-lg font-semibold tabular-nums text-muted">
              {formatDuration(seconds)}
            </p>
          </div>

          <div className="mt-4">
            <LoudnessWave historyRef={historyRef} levelRef={levelRef} live />
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              Максимум: <b className="tabular-nums text-text">{Math.round(peak)}</b> усл. дБ
            </p>
            <Button variant="danger" onClick={finish}>
              ⏹ Остановить
            </Button>
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="animate-fade-in py-4">
          <Card className="text-center">
            <span className="text-5xl">{resultReaction.emoji}</span>
            <p className="mt-4 text-sm font-medium uppercase tracking-wide text-muted">
              Максимальный пик
            </p>
            <p
              className="text-5xl font-bold tabular-nums"
              style={{ color: colorForLevel(finalPeak) }}
            >
              {Math.round(finalPeak)}
              <span className="ml-2 text-lg font-medium text-muted">усл. дБ</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Длительность замера: {formatDuration(seconds)}
            </p>
            <p className="mt-5 text-lg leading-relaxed">{resultReaction.message}</p>
          </Card>

          <div className="mt-4">
            <LoudnessWave historyRef={historyRef} levelRef={levelRef} live={false} />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>🔄 Попробовать ещё раз</Button>
            <Link to="/meditation?mode=0">
              <Button variant="secondary">🧘 Подышать</Button>
            </Link>
            <Link to="/techniques">
              <Button variant="secondary">💡 Техники</Button>
            </Link>
          </div>
        </div>
      )}

      {status === 'denied' && (
        <div className="py-10 text-center">
          <span className="text-5xl">🎙️</span>
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-amber-50 p-4 text-amber-900">
            {MIC_DENIED_MESSAGE}
          </p>
          <Button className="mt-6" onClick={() => void start()}>
            🔄 Попробовать снова
          </Button>
        </div>
      )}

      {status === 'unsupported' && (
        <div className="py-10 text-center">
          <span className="text-5xl">😔</span>
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-amber-50 p-4 text-amber-900">
            Браузер не поддерживает работу с микрофоном. Откройте сайт в свежем Chrome, Edge или
            Safari — или выпустите эмоции текстом.
          </p>
        </div>
      )}
    </div>
  )
}
