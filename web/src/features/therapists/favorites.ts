const FAVORITES_KEY = 'dobratimia:therapist-favorites'

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function toggleFavorite(id: string): string[] {
  const current = loadFavorites()
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  } catch {
    // Избранное не сохранится, но интерфейс продолжит работать.
  }
  return next
}
