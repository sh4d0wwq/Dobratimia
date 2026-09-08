/**
 * Обезличенная продуктовая аналитика по карточкам специалистов.
 * Хранится локально; при появлении бэкенда достаточно указать endpoint.
 */

export type TherapistEventType =
  | 'card_shown'
  | 'swipe_left'
  | 'swipe_right'
  | 'details_opened'
  | 'contact_clicked'
  | 'booking_clicked'
  | 'favorite_added'

export type TherapistEvent = {
  type: TherapistEventType
  therapistId: string
  /** Анонимный идентификатор сессии, без персональных данных. */
  sessionId: string
  at: string
}

const EVENTS_KEY = 'dobratimia:therapist-events'
const SESSION_KEY = 'dobratimia:analytics-session'
const EVENTS_LIMIT = 2000

/** Куда дублировать события, когда появится приёмник (POST с JSON). */
export const ANALYTICS_ENDPOINT = ''

function randomId(): string {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id = randomId()
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return 'anonymous'
  }
}

export function loadTherapistEvents(): TherapistEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TherapistEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function trackTherapistEvent(type: TherapistEventType, therapistId: string): void {
  const event: TherapistEvent = {
    type,
    therapistId,
    sessionId: getSessionId(),
    at: new Date().toISOString(),
  }

  try {
    const events = loadTherapistEvents()
    events.push(event)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-EVENTS_LIMIT)))
  } catch {
    // Аналитика не должна ломать основной сценарий.
  }

  if (ANALYTICS_ENDPOINT) {
    void fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => undefined)
  }
}

export type TherapistMetrics = {
  therapistId: string
  shows: number
  likes: number
  skips: number
  details: number
  contacts: number
  /** Доля положительных свайпов от всех свайпов. */
  likeRate: number | null
  /** Конверсия из показа в открытие профиля. */
  detailsRate: number | null
  /** Конверсия из открытия профиля в нажатие на контакт. */
  contactRate: number | null
}

export function computeTherapistMetrics(events = loadTherapistEvents()): TherapistMetrics[] {
  const byId = new Map<string, TherapistMetrics>()

  const ensure = (id: string): TherapistMetrics => {
    const existing = byId.get(id)
    if (existing) return existing
    const created: TherapistMetrics = {
      therapistId: id,
      shows: 0,
      likes: 0,
      skips: 0,
      details: 0,
      contacts: 0,
      likeRate: null,
      detailsRate: null,
      contactRate: null,
    }
    byId.set(id, created)
    return created
  }

  for (const event of events) {
    const row = ensure(event.therapistId)
    if (event.type === 'card_shown') row.shows += 1
    else if (event.type === 'swipe_right') row.likes += 1
    else if (event.type === 'swipe_left') row.skips += 1
    else if (event.type === 'details_opened') row.details += 1
    else if (event.type === 'contact_clicked' || event.type === 'booking_clicked')
      row.contacts += 1
  }

  return [...byId.values()]
    .map((row) => {
      const swipes = row.likes + row.skips
      return {
        ...row,
        likeRate: swipes > 0 ? row.likes / swipes : null,
        detailsRate: row.shows > 0 ? row.details / row.shows : null,
        contactRate: row.details > 0 ? row.contacts / row.details : null,
      }
    })
    .sort((a, b) => (b.likeRate ?? 0) - (a.likeRate ?? 0) || b.likes - a.likes)
}

export function clearTherapistEvents(): void {
  try {
    localStorage.removeItem(EVENTS_KEY)
  } catch {
    // Нечего очищать.
  }
}
