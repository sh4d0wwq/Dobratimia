import { assetUrl } from './assetUrl'

type Phase = 'inhale' | 'hold' | 'exhale'
type AmbientKind = 'rain' | 'wind' | 'forest'

const BREATHING_FILES: Record<Phase, string> = {
  inhale: 'assets/sounds/breathing/inhale.mp3',
  hold: 'assets/sounds/breathing/hold.mp3',
  exhale: 'assets/sounds/breathing/exhale.mp3',
}

const AMBIENT_FILES: Record<AmbientKind, string> = {
  rain: 'assets/sounds/ambient/rain.mp3',
  wind: 'assets/sounds/ambient/wind.mp3',
  forest: 'assets/sounds/ambient/forest.mp3',
}

let audioContext: AudioContext | null = null
let breathingGain: GainNode | null = null
let ambientGain: GainNode | null = null
let syntheticAmbient: { source: AudioBufferSourceNode; gain: GainNode } | null = null
let htmlAmbient: HTMLAudioElement | null = null
let breathingVolume = 0.7
let ambientVolume = 0.45
let syntheticBaseGain = 0.14
let preloadPromise: Promise<void> | null = null

const cueBuffers: Partial<Record<Phase, AudioBuffer>> = {}
const ambientElements: Partial<Record<AmbientKind, HTMLAudioElement>> = {}

function ensureContext(): AudioContext | null {
  const Ctx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null

  if (!audioContext) {
    audioContext = new Ctx()
    breathingGain = audioContext.createGain()
    ambientGain = audioContext.createGain()
    breathingGain.connect(audioContext.destination)
    ambientGain.connect(audioContext.destination)
  }

  breathingGain!.gain.value = breathingVolume
  ambientGain!.gain.value = 1
  return audioContext
}

export async function unlockAudio(): Promise<AudioContext | null> {
  const ctx = ensureContext()
  if (!ctx) return null
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      return null
    }
  }
  return ctx
}

export function setBreathingVolume(value: number): void {
  breathingVolume = Math.max(0, Math.min(1, value))
  ensureContext()
  if (breathingGain) breathingGain.gain.value = breathingVolume
}

export function setAmbientVolume(value: number): void {
  ambientVolume = Math.max(0, Math.min(1, value))
  ensureContext()
  if (htmlAmbient) htmlAmbient.volume = ambientVolume
  if (syntheticAmbient) {
    syntheticAmbient.gain.gain.value = syntheticBaseGain * (ambientVolume / 0.45)
  }
}

async function decodeCue(phase: Phase, ctx: AudioContext): Promise<void> {
  if (cueBuffers[phase]) return
  const res = await fetch(assetUrl(BREATHING_FILES[phase]))
  if (!res.ok) return
  const data = await res.arrayBuffer()
  cueBuffers[phase] = await ctx.decodeAudioData(data.slice(0))
}

function warmAmbientElement(kind: AmbientKind): HTMLAudioElement {
  const existing = ambientElements[kind]
  if (existing) return existing

  const audio = new Audio()
  audio.preload = 'auto'
  audio.loop = true
  audio.volume = ambientVolume
  audio.setAttribute('playsinline', 'true')
  audio.setAttribute('webkit-playsinline', 'true')
  audio.src = assetUrl(AMBIENT_FILES[kind])
  audio.load()
  ambientElements[kind] = audio
  return audio
}

export async function preloadMeditationAudio(): Promise<void> {
  if (preloadPromise) return preloadPromise

  preloadPromise = (async () => {
    const ctx = await unlockAudio()
    if (!ctx) return

    await Promise.all([
      decodeCue('inhale', ctx),
      decodeCue('hold', ctx),
      decodeCue('exhale', ctx),
    ])

    ;(Object.keys(AMBIENT_FILES) as AmbientKind[]).forEach(warmAmbientElement)
  })()

  return preloadPromise
}

function beepFallback(phase: Phase): void {
  const ctx = ensureContext()
  if (!ctx || !breathingGain) return
  if (ctx.state === 'suspended') void ctx.resume()

  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = 'sine'
  osc.connect(env)
  env.connect(breathingGain)

  const now = ctx.currentTime
  const duration = phase === 'hold' ? 0.28 : 0.35
  const start = phase === 'inhale' ? 320 : phase === 'hold' ? 400 : 480
  const end = phase === 'inhale' ? 420 : phase === 'hold' ? 400 : 300

  osc.frequency.setValueAtTime(start, now)
  osc.frequency.linearRampToValueAtTime(end, now + duration)
  env.gain.setValueAtTime(0.0001, now)
  env.gain.linearRampToValueAtTime(0.9, now + 0.03)
  env.gain.linearRampToValueAtTime(0.0001, now + duration)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function playBreathingPhaseSound(phase: Phase, enabled: boolean): void {
  if (!enabled || breathingVolume <= 0) return

  const ctx = ensureContext()
  if (!ctx || !breathingGain) return
  if (ctx.state === 'suspended') void ctx.resume()

  breathingGain.gain.value = breathingVolume
  const buffer = cueBuffers[phase]

  if (buffer) {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(breathingGain)
    source.start(0)
    return
  }

  beepFallback(phase)
  void preloadMeditationAudio()
}

function stopSyntheticAmbient(): void {
  if (syntheticAmbient) {
    try {
      syntheticAmbient.source.stop()
    } catch {
      /* already stopped */
    }
    syntheticAmbient.source.disconnect()
    syntheticAmbient.gain.disconnect()
    syntheticAmbient = null
  }
}

function stopHtmlAmbient(): void {
  if (htmlAmbient) {
    htmlAmbient.pause()
    try {
      htmlAmbient.currentTime = 0
    } catch {
      /* ignore */
    }
    htmlAmbient = null
  }
}

export function stopAmbientPlayback(): void {
  stopHtmlAmbient()
  stopSyntheticAmbient()
}

function playSyntheticAmbient(kind: AmbientKind): boolean {
  stopSyntheticAmbient()
  const ctx = ensureContext()
  if (!ctx || !ambientGain) return false

  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  if (kind === 'rain') {
    filter.type = 'lowpass'
    filter.frequency.value = 900
    syntheticBaseGain = 0.18
  } else if (kind === 'wind') {
    filter.type = 'bandpass'
    filter.frequency.value = 450
    filter.Q.value = 0.4
    syntheticBaseGain = 0.14
  } else {
    filter.type = 'lowpass'
    filter.frequency.value = 1400
    syntheticBaseGain = 0.11
  }

  gain.gain.value = syntheticBaseGain * (ambientVolume / 0.45)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ambientGain)
  source.start()
  syntheticAmbient = { source, gain }
  return true
}

export async function startAmbientSound(kind: AmbientKind): Promise<boolean> {
  await unlockAudio()
  await preloadMeditationAudio()
  stopAmbientPlayback()

  const audio = warmAmbientElement(kind)
  audio.volume = ambientVolume

  try {
    audio.currentTime = 0
  } catch {
    /* ignore */
  }

  try {
    await audio.play()
    htmlAmbient = audio
    return true
  } catch {
    return playSyntheticAmbient(kind)
  }
}
