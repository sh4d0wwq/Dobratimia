import { useCallback, useEffect, useRef, useState } from 'react'

export type PomodoroPhase = 'work' | 'break'

export const POMODORO_WORK_SEC = 25 * 60
export const POMODORO_BREAK_SEC = 5 * 60

/** Текст уведомлений — здесь же меняется при необходимости. */
export const POMODORO_PHASE_END_MESSAGE: Record<PomodoroPhase, string> = {
  work: 'Время фокусировки закончилось. Сделайте небольшой перерыв',
  break: 'Перерыв завершён. Готовы вернуться к делу?',
}

export const POMODORO_PHASE_END_TITLE: Record<PomodoroPhase, string> = {
  work: '🍅 Добратимия — перерыв',
  break: '🍅 Добратимия — снова к делу',
}

function phaseDuration(phase: PomodoroPhase): number {
  return phase === 'work' ? POMODORO_WORK_SEC : POMODORO_BREAK_SEC
}

/**
 * Таймер считает от абсолютного дедлайна, а не вычитанием секунд: браузер
 * замедляет таймеры на неактивной вкладке, и счёт иначе «уезжает».
 */
export function usePomodoro(onPhaseEnd: (finished: PomodoroPhase) => void) {
  const [phase, setPhase] = useState<PomodoroPhase>('work')
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(POMODORO_WORK_SEC)
  const [rounds, setRounds] = useState(0)

  const deadlineRef = useRef<number | null>(null)
  const remainingRef = useRef(POMODORO_WORK_SEC)
  const runningRef = useRef(false)
  const phaseRef = useRef<PomodoroPhase>('work')
  const onPhaseEndRef = useRef(onPhaseEnd)

  useEffect(() => {
    onPhaseEndRef.current = onPhaseEnd
  }, [onPhaseEnd])

  const applyRemaining = useCallback((value: number) => {
    remainingRef.current = value
    setRemaining(value)
  }, [])

  const advance = useCallback(() => {
    const finished = phaseRef.current
    const next: PomodoroPhase = finished === 'work' ? 'break' : 'work'
    const duration = phaseDuration(next)

    if (finished === 'work') setRounds((r) => r + 1)
    phaseRef.current = next
    setPhase(next)
    applyRemaining(duration)
    deadlineRef.current = Date.now() + duration * 1000
    onPhaseEndRef.current(finished)
  }, [applyRemaining])

  useEffect(() => {
    if (!running) return

    const tick = () => {
      const deadline = deadlineRef.current
      if (deadline === null) return
      const left = Math.ceil((deadline - Date.now()) / 1000)
      if (left <= 0) {
        advance()
        return
      }
      applyRemaining(left)
    }

    const interval = window.setInterval(tick, 500)
    // Отдельный таймаут ровно на момент финиша: на фоновой вкладке интервалы
    // душатся сильнее, чем одиночный setTimeout.
    const msLeft = Math.max(0, (deadlineRef.current ?? Date.now()) - Date.now())
    const timeout = window.setTimeout(tick, msLeft + 50)
    document.addEventListener('visibilitychange', tick)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [running, phase, advance, applyRemaining])

  const toggle = useCallback(() => {
    if (runningRef.current) {
      const deadline = deadlineRef.current
      if (deadline !== null) {
        applyRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
      }
      deadlineRef.current = null
      runningRef.current = false
      setRunning(false)
      return
    }

    deadlineRef.current = Date.now() + remainingRef.current * 1000
    runningRef.current = true
    setRunning(true)
  }, [applyRemaining])

  const reset = useCallback(() => {
    deadlineRef.current = null
    runningRef.current = false
    phaseRef.current = 'work'
    setRunning(false)
    setPhase('work')
    applyRemaining(POMODORO_WORK_SEC)
    setRounds(0)
  }, [applyRemaining])

  return { phase, running, remaining, rounds, toggle, reset }
}
