import { useEffect, useRef, useState } from 'react'
import { useSiteAudio } from '@/context/audio-store'

const AMBIENT_LABELS: Record<string, string> = {
  rain: 'Дождь',
  wind: 'Ветер',
  forest: 'Лес',
}

/** Единая кнопка управления звуком сайта: фоновая музыка и звук медитации. */
export function SoundToggle() {
  const {
    backgroundEnabled,
    backgroundPlaying,
    backgroundNeedsGesture,
    backgroundVolume,
    toggleBackground,
    changeBackgroundVolume,
    meditationAmbient,
    stopMeditationAmbient,
  } = useSiteAudio()

  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const soundOn = meditationAmbient !== null || (backgroundEnabled && backgroundPlaying)
  const hint = meditationAmbient
    ? `Медитация: ${AMBIENT_LABELS[meditationAmbient] ?? meditationAmbient}`
    : backgroundEnabled
      ? backgroundPlaying
        ? 'Фоновая музыка включена'
        : backgroundNeedsGesture
          ? 'Нажмите, чтобы запустить музыку'
          : 'Музыка загружается…'
      : 'Звук выключен'

  return (
    <div ref={wrapperRef} className="absolute top-3 right-3 z-30 text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={soundOn ? 'Звук включён' : 'Звук выключен'}
        title={hint}
        className="flex h-10 items-center gap-2 rounded-full bg-white/20 px-3 text-white backdrop-blur transition hover:bg-white/30"
      >
        <span className="text-lg leading-none">{soundOn ? '🔊' : '🔇'}</span>
        <span className="hidden text-xs font-semibold sm:inline">
          {soundOn ? 'Звук включён' : 'Звук выключен'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-4 text-text shadow-xl">
          <p className="text-sm font-semibold">Звук сайта</p>

          <button
            type="button"
            onClick={toggleBackground}
            className={`mt-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
              backgroundEnabled ? 'bg-primary/10 text-primary-dark' : 'bg-slate-100 text-muted'
            }`}
          >
            <span>Фоновая музыка</span>
            <span>{backgroundEnabled ? 'вкл' : 'выкл'}</span>
          </button>

          <label className="mt-3 block text-xs text-muted">
            Громкость фона: {backgroundVolume}%
            <input
              type="range"
              min={0}
              max={100}
              value={backgroundVolume}
              onChange={(e) => changeBackgroundVolume(Number(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary"
            />
          </label>

          {meditationAmbient && (
            <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-primary-dark">
              <p className="font-semibold">
                Играет медитация: {AMBIENT_LABELS[meditationAmbient] ?? meditationAmbient}
              </p>
              <p className="mt-1">Фон приглушён, пока идёт практика.</p>
              <button
                type="button"
                onClick={stopMeditationAmbient}
                className="mt-2 rounded-lg bg-white px-3 py-1.5 font-semibold shadow-sm transition hover:bg-slate-50"
              >
                ⏹ Остановить
              </button>
            </div>
          )}

          {backgroundNeedsGesture && !meditationAmbient && backgroundEnabled && (
            <p className="mt-3 text-xs text-muted">
              Браузер блокирует автозапуск звука — музыка включится после первого касания страницы.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
