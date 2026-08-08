import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  playBreathingPhaseSound,
  preloadMeditationAudio,
  setAmbientVolume,
  setBreathingVolume,
  startAmbientSound,
  stopAmbientPlayback,
  unlockAudio,
} from '@/lib/audio'
import { MeditationModeToggle } from './MeditationModeToggle'

type Phase = 'inhale' | 'hold' | 'exhale'
type PomodoroPhase = 'work' | 'break'

const MODES = [
  { label: '4-6', inhale: 4, hold: 0, exhale: 6 },
  { label: '4-7-8', inhale: 4, hold: 7, exhale: 8 },
  { label: '5-5-5', inhale: 5, hold: 5, exhale: 5 },
] as const

const AMBIENT = [
  { id: 'rain' as const, label: 'Дождь', emoji: '🌧️' },
  { id: 'wind' as const, label: 'Ветер', emoji: '💨' },
  { id: 'forest' as const, label: 'Лес', emoji: '🌲' },
]

const POMODORO_WORK_SEC = 25 * 60
const POMODORO_BREAK_SEC = 5 * 60

function VolumeSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex flex-col gap-2 text-left text-sm">
      <span className="font-medium text-text">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary"
        />
        <span className="w-10 shrink-0 text-right tabular-nums text-muted">{value}%</span>
      </div>
    </label>
  )
}

export function MeditationPage() {
  const [searchParams] = useSearchParams()
  const pomodoroMode = searchParams.get('pomodoro') === '1'
  const initialMode = Math.min(Math.max(Number(searchParams.get('mode') ?? 0), 0), MODES.length - 1)

  const [mode, setMode] = useState(initialMode)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [count, setCount] = useState<number>(MODES[initialMode].inhale)
  const [cycles, setCycles] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [signalVolume, setSignalVolume] = useState(70)
  const [ambientVol, setAmbientVol] = useState(45)
  const [ambientId, setAmbientId] = useState<string | null>(null)

  const runningRef = useRef(false)
  const modeRef = useRef(mode)
  const phaseRef = useRef<Phase>('inhale')
  const countRef = useRef<number>(MODES[initialMode].inhale)
  const soundEnabledRef = useRef(true)
  const timerRef = useRef<number | null>(null)

  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('work')
  const [pomodoroSec, setPomodoroSec] = useState(POMODORO_WORK_SEC)
  const [pomodoroRounds, setPomodoroRounds] = useState(0)

  const cfg = MODES[mode]

  const stopAmbient = useCallback(() => {
    stopAmbientPlayback()
    setAmbientId(null)
  }, [])

  useEffect(() => {
    void preloadMeditationAudio()
  }, [])

  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    runningRef.current = running
  }, [running])

  useEffect(() => () => stopAmbient(), [stopAmbient])

  useEffect(() => {
    if (pomodoroMode) stopAmbient()
    setRunning(false)
    runningRef.current = false
  }, [pomodoroMode, stopAmbient])

  useEffect(() => {
    const m = Math.min(Math.max(Number(searchParams.get('mode') ?? mode), 0), MODES.length - 1)
    if (searchParams.get('mode') !== null && !pomodoroMode) {
      setMode(m)
      setPhase('inhale')
      setCount(MODES[m].inhale)
      phaseRef.current = 'inhale'
      countRef.current = MODES[m].inhale
      setRunning(false)
      runningRef.current = false
    }
  }, [searchParams, pomodoroMode, mode])

  const playCue = useCallback((p: Phase) => {
    if (!soundEnabledRef.current) return
    playBreathingPhaseSound(p, true)
  }, [])

  const clearBreathingTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    clearBreathingTimer()
    if (pomodoroMode || !running) return

    timerRef.current = window.setInterval(() => {
      if (!runningRef.current) return

      const settings = MODES[modeRef.current]
      let nextCount = countRef.current - 1

      if (nextCount > 0) {
        countRef.current = nextCount
        setCount(nextCount)
        return
      }

      const currentPhase = phaseRef.current
      let nextPhase: Phase = 'inhale'
      let nextDuration: number = settings.inhale

      if (currentPhase === 'inhale') {
        if (settings.hold > 0) {
          nextPhase = 'hold'
          nextDuration = settings.hold
        } else {
          nextPhase = 'exhale'
          nextDuration = settings.exhale
        }
      } else if (currentPhase === 'hold') {
        nextPhase = 'exhale'
        nextDuration = settings.exhale
      } else {
        nextPhase = 'inhale'
        nextDuration = settings.inhale
        setCycles((n) => n + 1)
      }

      phaseRef.current = nextPhase
      countRef.current = nextDuration
      playCue(nextPhase)
      setPhase(nextPhase)
      setCount(nextDuration)
    }, 1000)

    return clearBreathingTimer
  }, [running, pomodoroMode, playCue])

  useEffect(() => {
    if (!pomodoroMode || !running) return

    const id = window.setInterval(() => {
      setPomodoroSec((s) => {
        if (s > 1) return s - 1
        setPomodoroPhase((p) => {
          if (p === 'work') {
            setPomodoroRounds((r) => r + 1)
            return 'break'
          }
          return 'work'
        })
        return -1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [running, pomodoroMode])

  useEffect(() => {
    if (pomodoroSec === -1) {
      setPomodoroSec(pomodoroPhase === 'break' ? POMODORO_BREAK_SEC : POMODORO_WORK_SEC)
    }
  }, [pomodoroSec, pomodoroPhase])

  const applySignalVolume = (value: number) => {
    setSignalVolume(value)
    void unlockAudio().then(() => setBreathingVolume(value / 100))
  }

  const applyAmbientVolume = (value: number) => {
    setAmbientVol(value)
    void unlockAudio().then(() => setAmbientVolume(value / 100))
  }

  const toggleAmbient = async (id: (typeof AMBIENT)[number]['id']) => {
    await unlockAudio()
    await preloadMeditationAudio()
    if (ambientId === id) {
      stopAmbient()
      return
    }
    const ok = await startAmbientSound(id)
    if (ok) {
      setAmbientVolume(ambientVol / 100)
      setAmbientId(id)
    }
  }

  const startBreathing = async () => {
    await unlockAudio()
    await preloadMeditationAudio()
    setBreathingVolume(signalVolume / 100)

    if (runningRef.current) {
      runningRef.current = false
      setRunning(false)
      return
    }

    playCue(phaseRef.current)
    runningRef.current = true
    setRunning(true)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (pomodoroMode) {
    return (
      <div>
        <PageHeader title="🧘 Медитации" subtitle="25 минут работы, 5 минут отдыха" />
        <MeditationModeToggle />
        <Card className="text-center">
          <p className="text-lg font-semibold text-primary">
            {pomodoroPhase === 'work' ? 'Работа' : 'Перерыв'}
          </p>
          <p className="mt-4 text-6xl font-bold tabular-nums">{formatTime(pomodoroSec)}</p>
          <p className="mt-2 text-sm text-muted">Завершено циклов: {pomodoroRounds}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => void unlockAudio().then(() => setRunning((r) => !r))}>
              {running ? '⏸ Пауза' : '▶️ Начать'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRunning(false)
                setPomodoroPhase('work')
                setPomodoroSec(POMODORO_WORK_SEC)
                setPomodoroRounds(0)
              }}
            >
              🔄 Сброс
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const phaseLabel = phase === 'inhale' ? 'Вдох' : phase === 'hold' ? 'Задержка' : 'Выдох'

  return (
    <div>
      <PageHeader title="🧘 Медитации" subtitle="Дыхательные практики и звуки природы" />
      <MeditationModeToggle />

      <Card className="mb-6 text-center">
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {MODES.map((m, i) => (
            <button
              key={m.label}
              type="button"
              onClick={() => {
                setMode(i)
                setRunning(false)
                runningRef.current = false
                setPhase('inhale')
                setCount(MODES[i].inhale)
                phaseRef.current = 'inhale'
                countRef.current = MODES[i].inhale
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === i ? 'bg-primary text-white' : 'bg-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            void unlockAudio()
            setSoundEnabled((v) => !v)
          }}
          className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            soundEnabled
              ? 'bg-primary/10 text-primary ring-1 ring-primary/25'
              : 'bg-slate-100 text-muted'
          }`}
        >
          <span aria-hidden>{soundEnabled ? '🔊' : '🔇'}</span>
          Звуковые сигналы
        </button>

        <div
          className={`mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 transition ${
            running ? 'border-primary bg-emerald-50 scale-105' : 'border-slate-200'
          }`}
        >
          <span className="text-lg font-semibold text-primary">{phaseLabel}</span>
          <span className="text-5xl font-bold">{count}</span>
          <span className="text-sm text-muted">Циклов: {cycles}</span>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => void startBreathing()}>{running ? '⏸ Пауза' : '▶️ Начать'}</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setRunning(false)
              runningRef.current = false
              setPhase('inhale')
              setCount(cfg.inhale)
              setCycles(0)
              phaseRef.current = 'inhale'
              countRef.current = cfg.inhale
            }}
          >
            🔄 Сброс
          </Button>
        </div>

        <div className="mx-auto mt-6 max-w-sm space-y-4 text-left">
          <VolumeSlider label="Громкость сигналов дыхания" value={signalVolume} onChange={applySignalVolume} />
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold">🎧 Фоновые звуки</h3>
        <p className="mb-4 text-sm text-muted">Выберите звук природы для расслабления во время практики.</p>
        <div className="mb-6 max-w-sm">
          <VolumeSlider label="Громкость фона" value={ambientVol} onChange={applyAmbientVolume} />
        </div>
        <div className="flex flex-wrap gap-2">
          {AMBIENT.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => void toggleAmbient(a.id)}
              className={`rounded-xl border px-4 py-3 text-center hover:border-primary ${
                ambientId === a.id ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="mt-1 block text-sm">{a.label}</span>
            </button>
          ))}
          {ambientId && (
            <Button variant="secondary" onClick={stopAmbient}>
              ⏹ Стоп
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
