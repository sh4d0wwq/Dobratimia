import { useEffect, useRef, type RefObject } from 'react'
import { colorForLevel } from './loudnessReactions'
import { MAX_LEVEL } from './useLoudnessMeter'

const BAR_WIDTH = 4
const BAR_GAP = 3

/**
 * Столбчатый график громкости в стиле голосового сообщения.
 * Рисуется из refs, чтобы 60fps не перерисовывал React-дерево.
 */
export function LoudnessWave({
  historyRef,
  levelRef,
  live,
}: {
  historyRef: RefObject<number[]>
  levelRef: RefObject<number>
  live: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let raf = 0

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const middle = height / 2
      const step = BAR_WIDTH + BAR_GAP
      const capacity = Math.max(1, Math.floor(width / step))
      const history = historyRef.current ?? []
      const bars = live
        ? history.slice(-capacity)
        : downsample(history, capacity)

      // Осевая линия, чтобы пустая область не выглядела «сломанной».
      ctx.fillStyle = 'rgb(148 163 184 / 0.35)'
      ctx.fillRect(0, middle - 0.5, width, 1)

      const offset = live ? width - bars.length * step : 0
      bars.forEach((value, index) => {
        const ratio = Math.min(1, value / MAX_LEVEL)
        const barHeight = Math.max(2, ratio * (height - 6))
        const x = offset + index * step
        ctx.fillStyle = colorForLevel(value)
        roundedBar(ctx, x, middle - barHeight / 2, BAR_WIDTH, barHeight)
      })

      if (live) {
        const current = Math.min(1, (levelRef.current ?? 0) / MAX_LEVEL)
        ctx.fillStyle = colorForLevel(levelRef.current ?? 0)
        ctx.globalAlpha = 0.25
        ctx.fillRect(0, middle - (current * height) / 2, width, current * height)
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [historyRef, levelRef, live])

  return (
    <canvas
      ref={canvasRef}
      className="h-28 w-full rounded-2xl bg-slate-900/95 sm:h-36"
      role="img"
      aria-label="График громкости голоса"
    />
  )
}

function roundedBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  if (typeof ctx.roundRect !== 'function') {
    ctx.fillRect(x, y, w, h)
    return
  }
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, Math.min(w / 2, h / 2))
  ctx.fill()
}

/** Сжимаем всю запись до ширины графика, беря максимум по каждой корзине. */
function downsample(values: number[], target: number): number[] {
  if (values.length <= target) return values
  const bucket = values.length / target
  const result: number[] = []
  for (let i = 0; i < target; i++) {
    const from = Math.floor(i * bucket)
    const to = Math.max(from + 1, Math.floor((i + 1) * bucket))
    let max = 0
    for (let j = from; j < to && j < values.length; j++) {
      if (values[j] > max) max = values[j]
    }
    result.push(max)
  }
  return result
}
