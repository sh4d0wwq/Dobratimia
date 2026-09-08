import { useCallback, useState } from 'react'

export type Particle = { id: number; x: number; y: number; tx: number; ty: number; color: string }

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981']

export function useScreamParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  const burst = useCallback((count = 120) => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    setParticles(
      Array.from({ length: count }, (_, id) => {
        const angle = Math.random() * Math.PI * 2
        const distance = 100 + Math.random() * 350
        return {
          id,
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + (Math.random() - 0.5) * 80,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }
      }),
    )
    window.setTimeout(() => setParticles([]), 1400)
  }, [])

  return { particles, burst }
}
