import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/context/ToastContext'
import { playTimerChime, unlockAudio } from '@/lib/audio'
import {
  NOTIFICATION_DENIED_HINT,
  getNotificationPermission,
  requestNotificationPermission,
  showAppNotification,
  type PermissionState,
} from '@/lib/notifications'
import {
  POMODORO_PHASE_END_MESSAGE,
  POMODORO_PHASE_END_TITLE,
  usePomodoro,
  type PomodoroPhase,
} from './usePomodoro'

const SOUND_KEY = 'dobratimia:pomodoro-sound'

function readSoundSetting(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== '0'
  } catch {
    return true
  }
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PomodoroPanel() {
  const { showToast } = useToast()
  const [soundEnabled, setSoundEnabled] = useState(readSoundSetting)
  const [permission, setPermission] = useState<PermissionState>(getNotificationPermission)
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, soundEnabled ? '1' : '0')
    } catch {
      // Настройка не сохранится, но работать будет.
    }
  }, [soundEnabled])

  const handlePhaseEnd = useCallback(
    (finished: PomodoroPhase) => {
      const message = POMODORO_PHASE_END_MESSAGE[finished]
      setBanner(message)
      showToast(message)
      if (soundEnabled) void playTimerChime()
      void showAppNotification(POMODORO_PHASE_END_TITLE[finished], message)
    },
    [showToast, soundEnabled],
  )

  const { phase, running, remaining, rounds, toggle, reset } = usePomodoro(handlePhaseEnd)

  const enableNotifications = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') showToast('🔔 Уведомления Pomodoro включены')
  }

  return (
    <Card className="text-center">
      <p className="text-lg font-semibold text-primary">
        {phase === 'work' ? 'Работа' : 'Перерыв'}
      </p>
      <p className="mt-4 text-6xl font-bold tabular-nums">{formatTime(remaining)}</p>
      <p className="mt-2 text-sm text-muted">Завершено циклов: {rounds}</p>

      {banner && (
        <p className="mx-auto mt-4 max-w-sm rounded-xl bg-emerald-50 p-3 text-sm text-primary-dark">
          {banner}
        </p>
      )}

      <div className="mt-6 flex justify-center gap-2">
        <Button
          onClick={() => {
            setBanner(null)
            void unlockAudio()
            toggle()
          }}
        >
          {running ? '⏸ Пауза' : '▶️ Начать'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setBanner(null)
            reset()
          }}
        >
          🔄 Сброс
        </Button>
      </div>

      <div className="mx-auto mt-6 max-w-sm space-y-3 text-left">
        <button
          type="button"
          onClick={() => {
            void unlockAudio()
            setSoundEnabled((v) => !v)
          }}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            soundEnabled ? 'bg-primary/10 text-primary-dark' : 'bg-slate-100 text-muted'
          }`}
        >
          <span>{soundEnabled ? '🔊' : '🔇'} Звуковое уведомление</span>
          <span>{soundEnabled ? 'включено' : 'выключено'}</span>
        </button>

        {permission === 'granted' ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-primary-dark">
            🔔 Уведомления включены — сигнал придёт даже с другой вкладки, пока сайт открыт.
          </p>
        ) : permission === 'denied' ? (
          <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            {NOTIFICATION_DENIED_HINT}
          </p>
        ) : permission === 'unsupported' ? (
          <p className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-muted">
            Браузер не поддерживает push-уведомления — сообщение появится на самом сайте.
          </p>
        ) : (
          <Button variant="secondary" onClick={() => void enableNotifications()} className="w-full">
            🔔 Включить уведомления Pomodoro
          </Button>
        )}
      </div>
    </Card>
  )
}
