import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  getBackgroundPosition,
  pauseBackgroundMusic,
  playBackgroundMusic,
  setBackgroundVolume,
  startAmbientSound,
  stopAmbientPlayback,
  type AmbientKind,
} from '@/lib/audio'
import {
  BG_ENABLED_KEY,
  BG_POSITION_KEY,
  BG_VOLUME_KEY,
  SiteAudioContext,
  readStoredBackgroundEnabled,
  readStoredBackgroundPosition,
  readStoredBackgroundVolume,
  type SiteAudioValue,
} from './audio-store'

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Хранилище недоступно — настройка живёт только в этой сессии.
  }
}

/**
 * Единый аудиоплеер сайта. Живёт выше роутера, поэтому переходы между
 * разделами не перезапускают музыку и не сбрасывают громкость.
 */
export function SiteAudioProvider({ children }: { children: ReactNode }) {
  const [backgroundEnabled, setBackgroundEnabled] = useState(readStoredBackgroundEnabled)
  const [backgroundVolume, setVolumeState] = useState(readStoredBackgroundVolume)
  const [backgroundStarted, setBackgroundStarted] = useState(false)
  const [backgroundNeedsGesture, setNeedsGesture] = useState(false)
  const [meditationAmbient, setMeditationAmbient] = useState<AmbientKind | null>(null)
  const [meditationSessionActive, setMeditationSessionActive] = useState(false)

  const startPositionRef = useRef(readStoredBackgroundPosition())

  useEffect(() => {
    setBackgroundVolume(backgroundVolume / 100)
    persist(BG_VOLUME_KEY, String(backgroundVolume))
  }, [backgroundVolume])

  useEffect(() => {
    persist(BG_ENABLED_KEY, backgroundEnabled ? '1' : '0')
  }, [backgroundEnabled])

  // Медитация приоритетнее: пока она звучит, фон молчит и не накладывается.
  const shouldPlayBackground =
    backgroundEnabled && meditationAmbient === null && !meditationSessionActive

  useEffect(() => {
    if (!shouldPlayBackground) {
      pauseBackgroundMusic()
      return
    }

    let cancelled = false
    void playBackgroundMusic(startPositionRef.current).then((ok) => {
      if (cancelled) return
      setBackgroundStarted(ok)
      setNeedsGesture(!ok)
    })

    return () => {
      cancelled = true
    }
  }, [shouldPlayBackground])

  const backgroundPlaying = shouldPlayBackground && backgroundStarted

  // Автозапуск со звуком браузеры блокируют — стартуем на первом действии.
  useEffect(() => {
    if (!backgroundNeedsGesture || !shouldPlayBackground) return

    const tryPlay = () => {
      void playBackgroundMusic(startPositionRef.current).then((ok) => {
        if (!ok) return
        setBackgroundStarted(true)
        setNeedsGesture(false)
      })
    }

    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart']
    events.forEach((event) => window.addEventListener(event, tryPlay, { once: true }))
    return () => events.forEach((event) => window.removeEventListener(event, tryPlay))
  }, [backgroundNeedsGesture, shouldPlayBackground])

  // Запоминаем позицию, чтобы после перезагрузки продолжить с того же места.
  useEffect(() => {
    const save = () => persist(BG_POSITION_KEY, String(Math.floor(getBackgroundPosition())))
    const id = window.setInterval(save, 5000)
    window.addEventListener('pagehide', save)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('pagehide', save)
      save()
    }
  }, [])

  const toggleBackground = useCallback(() => setBackgroundEnabled((v) => !v), [])

  const changeBackgroundVolume = useCallback((percent: number) => {
    setVolumeState(Math.max(0, Math.min(100, Math.round(percent))))
  }, [])

  const startMeditationAmbient = useCallback(async (kind: AmbientKind) => {
    pauseBackgroundMusic()
    const ok = await startAmbientSound(kind)
    setMeditationAmbient(ok ? kind : null)
    return ok
  }, [])

  const stopMeditationAmbient = useCallback(() => {
    stopAmbientPlayback()
    setMeditationAmbient(null)
  }, [])

  const value = useMemo<SiteAudioValue>(
    () => ({
      backgroundEnabled,
      backgroundPlaying,
      backgroundNeedsGesture,
      backgroundVolume,
      toggleBackground,
      changeBackgroundVolume,
      meditationAmbient,
      startMeditationAmbient,
      stopMeditationAmbient,
      setMeditationSessionActive,
    }),
    [
      backgroundEnabled,
      backgroundPlaying,
      backgroundNeedsGesture,
      backgroundVolume,
      toggleBackground,
      changeBackgroundVolume,
      meditationAmbient,
      startMeditationAmbient,
      stopMeditationAmbient,
    ],
  )

  return <SiteAudioContext.Provider value={value}>{children}</SiteAudioContext.Provider>
}
