import { Link } from 'react-router-dom'

export function SosFab() {
  return (
    <Link
      to="/resources"
      aria-label="Экстренная помощь 133"
      className="fixed right-4 bottom-24 z-40 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 transition hover:scale-105 hover:bg-red-700 lg:bottom-8"
    >
      <span className="text-[0.65rem] font-bold leading-none">SOS</span>
      <span className="text-sm font-bold leading-none">133</span>
    </Link>
  )
}
