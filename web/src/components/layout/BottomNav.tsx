import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/config/navigation'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md lg:hidden">
      <div className="scrollbar-hide overflow-x-auto">
        <ul className="flex w-max min-w-full px-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className="shrink-0">
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex min-w-[4.25rem] flex-col items-center gap-0.5 px-2.5 py-2 text-[0.65rem] font-medium ${
                    isActive ? 'text-primary' : 'text-muted'
                  } ${item.accent === 'scream' && isActive ? 'text-danger' : ''}`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="max-w-[4.5rem] truncate text-center leading-tight">
                  {item.label.split(' ')[0]}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
