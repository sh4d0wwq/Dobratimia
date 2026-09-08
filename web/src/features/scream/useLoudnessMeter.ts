import { useCallback, useEffect, useRef, useState } from 'react'

export type MeterStatus = 'idle' | 'requesting' | 'recording' | 'done' | 'denied' | 'unsupported'

export const MAX_LEVEL = 130
/** Сколько последних замеров держим для графика. */
const HISTORY_LIMIT = 600
/** Как часто обновляем числа в React (мс) — график рисуется по refs на 60fps. */
const UI_TICK_MS = 80

export const MIC_DENIED_MESSAGE =
  'Для работы «КРИКа» нужен доступ к микрофону. Разрешите его в настройках браузера и попробуйте снова.'

type AudioCtxCtor = typeof AudioContext

function getAudioContextCtor(): AudioCtxCtor | null {
  const w = window as typeof window & { webkitAudioContext?: AudioCtxCtor }
  return window.AudioContext ?? w.webkitAudioContext ?? null
}

/**
 * Условный уровень 0..130 из RMS входного сигнала. Это не dB SPL:
 * браузер не даёт калиброванного значения, поэтому шкала ориентировочная.
 */
export function levelFromRms(rms: number): number {
  if (!Number.isFinite(rms) || rms <= 0) return 0
  const dbfs = 20 * Math.log10(rms)
  return Math.max(0, Math.min(MAX_LEVEL, (dbfs + 70) * 1.85))
}

export function useLoudnessMeter() {
  const [status, setStatus] = useState<MeterStatus>('idle')
  const [level, setLevel] = useState(0)
  const [peak, setPeak] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const historyRef = useRef<number[]>([])
  const levelRef = useRef(0)
  const peakRef = useRef(0)
  const statusRef = useRef(status)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const rafRef = useRef(0)
  const uiTimerRef = useRef(0)
  const startedAtRef = useRef(0)

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    window.clearInterval(uiTimerRef.current)
    sourceRef.current?.disconnect()
    analyserRef.current?.disconnect()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    void contextRef.current?.close().catch(() => undefined)
    sourceRef.current = null
    analyserRef.current = null
    streamRef.current = null
    contextRef.current = null
  }, [])

  useEffect(() => teardown, [teardown])

  const start = useCallback(async () => {
    const Ctx = getAudioContextCtor()
    if (!navigator.mediaDevices?.getUserMedia || !Ctx) {
      setStatus('unsupported')
      return
    }

    setStatus('requesting')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Обработка микрофона искажает уровень, поэтому просим её отключить.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch {
      setStatus('denied')
      return
    }

    const context = new Ctx()
    if (context.state === 'suspended') await context.resume().catch(() => undefined)

    const analyser = context.createAnalyser()
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.2
    const source = context.createMediaStreamSource(stream)
    source.connect(analyser)

    streamRef.current = stream
    contextRef.current = context
    analyserRef.current = analyser
    sourceRef.current = source

    historyRef.current = []
    levelRef.current = 0
    peakRef.current = 0
    startedAtRef.current = performance.now()
    setLevel(0)
    setPeak(0)
    setSeconds(0)
    setStatus('recording')

    const samples = new Float32Array(analyser.fftSize)
    const measure = () => {
      analyser.getFloatTimeDomainData(samples)
      let sum = 0
      for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i]
      const next = levelFromRms(Math.sqrt(sum / samples.length))

      // Быстрый подъём, плавный спад — как в индикаторах записи голоса.
      const smoothed = next > levelRef.current ? next : levelRef.current * 0.82 + next * 0.18
      levelRef.current = smoothed
      if (smoothed > peakRef.current) peakRef.current = smoothed

      const history = historyRef.current
      history.push(smoothed)
      if (history.length > HISTORY_LIMIT) history.shift()

      rafRef.current = requestAnimationFrame(measure)
    }
    rafRef.current = requestAnimationFrame(measure)

    uiTimerRef.current = window.setInterval(() => {
      setLevel(levelRef.current)
      setPeak(peakRef.current)
      setSeconds((performance.now() - startedAtRef.current) / 1000)
    }, UI_TICK_MS)
  }, [])

  /** Возвращает итоговые значения: state обновляется только к следующему рендеру. */
  const stop = useCallback(() => {
    if (statusRef.current !== 'recording') return { peak: peakRef.current, seconds: 0 }

    const elapsed = (performance.now() - startedAtRef.current) / 1000
    setLevel(levelRef.current)
    setPeak(peakRef.current)
    setSeconds(elapsed)
    teardown()
    setStatus('done')
    return { peak: peakRef.current, seconds: elapsed }
  }, [teardown])

  const reset = useCallback(() => {
    teardown()
    historyRef.current = []
    levelRef.current = 0
    peakRef.current = 0
    setLevel(0)
    setPeak(0)
    setSeconds(0)
    setStatus('idle')
  }, [teardown])

  return { status, level, peak, seconds, historyRef, levelRef, start, stop, reset }
}
