import { assetUrl } from '@/lib/assetUrl'
import { SoundToggle } from './SoundToggle'

export function Header() {
  return (
    <header className="relative bg-gradient-to-br from-primary via-emerald-500 to-secondary px-6 py-8 text-center text-white shadow-md lg:py-6">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)',
        }}
      />
      <SoundToggle />
      <div className="relative mx-auto flex max-w-lg flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-4 ring-white/20 lg:h-24 lg:w-24">
          <img
            src={assetUrl('icons/logo.png')}
            alt="Добратимия"
            className="h-[84%] w-[84%] object-contain"
            style={{ objectPosition: '50% 50%', transform: 'translate(2px, -1px)' }}
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Добратимия</h1>
        <p className="text-sm text-white/90 lg:text-base">Территория гармонии и спокойствия</p>
      </div>
    </header>
  )
}
