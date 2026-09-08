import type { CSSProperties } from 'react'
import type { Particle } from './useScreamParticles'

export function ScreamParticles({ particles }: { particles: Particle[] }) {
  if (particles.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute block h-2.5 w-2.5 animate-[explode_1.2s_ease-out_forwards] rounded-sm"
          style={
            {
              left: p.x,
              top: p.y,
              background: p.color,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
