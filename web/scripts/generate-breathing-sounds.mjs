import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const root = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(root, '../public/assets/sounds/breathing')
fs.mkdirSync(outDir, { recursive: true })

if (!ffmpegPath) {
  console.error('ffmpeg-static not found')
  process.exit(1)
}

const tones = [
  { name: 'inhale.mp3', freq: 320, dur: 0.35, fadeOut: 0.25, vol: 0.85 },
  { name: 'hold.mp3', freq: 400, dur: 0.28, fadeOut: 0.18, vol: 0.75 },
  { name: 'exhale.mp3', freq: 480, dur: 0.35, fadeOut: 0.25, vol: 0.85 },
]

for (const t of tones) {
  const out = path.join(outDir, t.name)
  const args = [
    '-y',
    '-f',
    'lavfi',
    '-i',
    `sine=frequency=${t.freq}:duration=${t.dur}`,
    '-af',
    `afade=t=in:st=0:d=0.05,afade=t=out:st=${t.fadeOut}:d=0.1,volume=${t.vol}`,
    '-ar',
    '44100',
    '-ac',
    '1',
    out,
  ]
  const res = spawnSync(ffmpegPath, args, { encoding: 'utf8' })
  if (res.status !== 0) {
    console.error(res.stderr)
    process.exit(res.status ?? 1)
  }
  console.log('ok', t.name, fs.statSync(out).size)
}
