import { createContext, useContext } from 'react'
import type { AmbientKind } from '@/lib/audio'

export type SiteAudioValue = {
  /** Общая фоновая музыка сайта. */
  backgroundEnabled: boolean
  backgroundPlaying: boolean
  /** true, если браузер заблокировал автозапуск и ждёт действия пользователя. */
  backgroundNeedsGesture: boolean
  backgroundVolume: number
  toggleBackground: () => void
  changeBackgroundVolume: (percent: number) => void
  /** Звук медитации имеет приоритет: пока он играет, фон стоит на паузе. */
  meditationAmbient: AmbientKind | null
  startMeditationAmbient: (kind: AmbientKind) => Promise<boolean>
  stopMeditationAmbient: () => void
  /** Идёт озвученная дыхательная практика — фон тоже уступает ей. */
  setMeditationSessionActive: (active: boolean) => void
}

export const SiteAudioContext = createContext<SiteAudioValue | null>(null)

export function useSiteAudio(): SiteAudioValue {
  const ctx = useContext(SiteAudioContext)
  if (!ctx) throw new Error('useSiteAudio must be used within SiteAudioProvider')
  return ctx
}

export const BG_ENABLED_KEY = 'dobratimia:bg-music-enabled'
export const BG_VOLUME_KEY = 'dobratimia:bg-music-volume'
export const BG_POSITION_KEY = 'dobratimia:bg-music-position'

export const DEFAULT_BG_VOLUME = 15

export function readStoredBackgroundEnabled(): boolean {
  try {
    return localStorage.getItem(BG_ENABLED_KEY) !== '0'
  } catch {
    return true
  }
}

export function readStoredBackgroundVolume(): number {
  try {
    const raw = Number(localStorage.getItem(BG_VOLUME_KEY))
    if (!Number.isFinite(raw) || raw < 0 || raw > 100) return DEFAULT_BG_VOLUME
    return raw
  } catch {
    return DEFAULT_BG_VOLUME
  }
}

export function readStoredBackgroundPosition(): number {
  try {
    const raw = Number(localStorage.getItem(BG_POSITION_KEY))
    return Number.isFinite(raw) && raw >= 0 ? raw : 0
  } catch {
    return 0
  }
}
