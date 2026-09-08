import { useEffect, useState } from 'react'
import { RESOURCES } from '@/data/resources'

const STORAGE_KEY = 'dobratimia:help-drawer-open'

function readStoredState(): boolean {
  try {
    // Шторка закрыта при первом открытии сайта.
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Тёмная шторка с телефонами помощи на десктопе.
 * Закрыта по умолчанию, в закрытом виде остаётся ярлык у левого края.
 */
export function Sidebar() {
  const [open, setOpen] = useState(readStoredState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, open ? '1' : '0')
    } catch {
      // Хранилище недоступно — состояние живёт только в этой сессии.
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="hidden lg:block">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Открыть телефоны помощи"
          className="fixed top-1/2 left-0 z-40 flex -translate-y-1/2 flex-col items-center gap-1 rounded-r-xl bg-sidebar px-2 py-4 text-white shadow-lg transition hover:bg-slate-700"
        >
          <span className="text-lg">🆘</span>
          <span className="text-xs font-bold [writing-mode:vertical-rl]">Помощь · 133</span>
        </button>
      )}

      {open && (
        <button
          type="button"
          aria-label="Закрыть шторку"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40"
        />
      )}

      <aside
        className={`scrollbar-subtle fixed top-0 left-0 z-50 h-full w-80 overflow-y-auto bg-sidebar p-6 text-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="mb-6 flex items-start justify-between gap-3 border-b border-white/10 pb-6">
          <div>
            <p className="text-xl font-bold">Добратимия</p>
            <p className="mt-1 text-sm text-white/70">Территория гармонии</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Свернуть шторку"
            className="rounded-lg px-2 py-1 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {RESOURCES.map((block) => (
          <section key={block.title} className="mb-6">
            <h2 className="mb-3 text-xs font-semibold tracking-wide uppercase text-white/50">
              {block.title}
            </h2>
            {block.items.map((item) => (
              <div
                key={item.title}
                className="mb-2 rounded-lg border-l-2 border-transparent bg-white/5 p-3 text-sm transition hover:border-primary hover:bg-white/10"
              >
                <p className="font-semibold">{item.title}</p>
                {item.content && <p className="mt-1 text-white/70">{item.content}</p>}
                {item.phone && item.href && (
                  <a href={item.href} className="mt-2 block font-bold text-primary">
                    {item.phone}
                  </a>
                )}
                {item.phones?.map((p) => (
                  <div key={p.href} className="mt-2">
                    {p.label && <p className="text-xs text-white/80">{p.label}</p>}
                    <a href={p.href} className="block font-bold text-primary">
                      {p.phone}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))}

        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          ⚠️ Платформа не заменяет профессиональную помощь. При кризисе звоните 133.
        </p>
      </aside>
    </div>
  )
}
