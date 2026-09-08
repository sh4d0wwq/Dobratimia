/**
 * Счётчик посещений за день. Сайт статический (GitHub Pages), поэтому
 * состояние хранится во внешнем keyless-счётчике: основной провайдер + резервный.
 * Значение приблизительное и не является строгой статистикой.
 */

const NAMESPACE = 'dobratimia.app'
const SESSION_PREFIX = 'dobratimia:visit-counted:'
/** Ждём, пока станет ясно, что это живой посетитель, а не префетч/бот. */
const COUNT_DELAY_MS = 1500

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pagespeed|preview|monitor|pingdom|gtmetrix|facebookexternalhit|whatsapp|telegrambot/i

type Provider = {
  hit: (key: string) => string
  get: (key: string) => string
  parse: (data: unknown) => number | null
}

const PROVIDERS: Provider[] = [
  {
    hit: (key) => `https://abacus.jasoncameron.dev/hit/${NAMESPACE}/${key}`,
    get: (key) => `https://abacus.jasoncameron.dev/get/${NAMESPACE}/${key}`,
    parse: (data) => numberFrom((data as { value?: unknown })?.value),
  },
  {
    hit: (key) => `https://countapi.mileshilliard.com/api/v1/hit/${flatKey(key)}`,
    get: (key) => `https://countapi.mileshilliard.com/api/v1/get/${flatKey(key)}`,
    parse: (data) => numberFrom((data as { value?: unknown })?.value),
  },
]

function numberFrom(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null
}

/** У резервного провайдера нет namespace — склеиваем его в ключ. */
function flatKey(key: string): string {
  return `${NAMESPACE}_${key}`.replace(/[^A-Za-z0-9_]/g, '_')
}

export function dayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `visits-${y}-${m}-${d}`
}

function isLikelyBot(): boolean {
  if (navigator.webdriver) return true
  return BOT_PATTERN.test(navigator.userAgent)
}

async function request(url: string, provider: Provider): Promise<number | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return provider.parse(await res.json())
  } catch {
    return null
  }
}

async function readCount(key: string): Promise<number | null> {
  for (const provider of PROVIDERS) {
    const value = await request(provider.get(key), provider)
    if (value !== null) return value
  }
  return null
}

async function incrementCount(key: string): Promise<number | null> {
  for (const provider of PROVIDERS) {
    const value = await request(provider.hit(key), provider)
    if (value !== null) return value
  }
  return null
}

/**
 * Учитывает посещение один раз за сессию браузера: обновления страницы и
 * переходы между разделами счётчик не накручивают.
 */
export async function registerVisit(): Promise<number | null> {
  const key = dayKey()
  if (isLikelyBot()) return readCount(key)

  const sessionKey = `${SESSION_PREFIX}${key}`
  let alreadyCounted: boolean
  try {
    alreadyCounted = sessionStorage.getItem(sessionKey) === '1'
  } catch {
    // Приватный режим без sessionStorage — просто читаем значение.
    return readCount(key)
  }

  if (alreadyCounted) return readCount(key)

  await new Promise((resolve) => window.setTimeout(resolve, COUNT_DELAY_MS))
  if (document.visibilityState === 'hidden') return readCount(key)

  const value = await incrementCount(key)
  if (value !== null) {
    try {
      sessionStorage.setItem(sessionKey, '1')
    } catch {
      // Не критично: в худшем случае посещение учтётся повторно.
    }
  }
  return value
}

export async function fetchDayCount(date: Date): Promise<number | null> {
  return readCount(dayKey(date))
}

/** Последние `days` дней, начиная с сегодняшнего. */
export async function fetchRecentCounts(
  days: number,
): Promise<{ date: Date; count: number | null }[]> {
  const result: { date: Date; count: number | null }[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    result.push({ date, count: await fetchDayCount(date) })
  }
  return result
}
