export type TherapistFormat = 'online' | 'offline'

export type TherapistContact = {
  kind: 'telegram' | 'phone' | 'email' | 'site' | 'booking'
  label: string
  value: string
  href: string
}

export type Therapist = {
  id: string
  /** Специалиста можно скрыть, не удаляя профиль. */
  visible: boolean
  name: string
  /** Путь к фото в public/, если нет — покажем аватар с инициалами. */
  photo?: string
  specializations: string[]
  /** Короткая авторская подпись — специалист может менять её сам. */
  quote: string
  description: string
  experienceYears?: number
  approach?: string[]
  formats: TherapistFormat[]
  languages: string[]
  price?: string
  /** Контакты публикуются только с согласия специалиста. */
  contactsAllowed: boolean
  contacts: TherapistContact[]
}

export const FORMAT_LABELS: Record<TherapistFormat, string> = {
  online: 'Онлайн',
  offline: 'Личная встреча',
}

/**
 * Демонстрационные профили. Реальные данные и фото публикуются только с
 * согласия специалистов; пока правятся здесь, дальше — через админку.
 */
export const THERAPISTS: Therapist[] = [
  {
    id: 'anna-ivanova',
    visible: true,
    name: 'Анна Иванова',
    specializations: ['Тревога', 'Выгорание', 'Студенческий стресс'],
    quote: 'Забота о себе — это не награда за продуктивность, а её условие.',
    description:
      'Работаю со студентами и молодыми специалистами: тревога перед экзаменами, выгорание, ощущение «я не справляюсь». Помогаю разобрать, что именно истощает, и найти посильные шаги.',
    experienceYears: 8,
    approach: ['КПТ', 'Схема-терапия'],
    formats: ['online', 'offline'],
    languages: ['Русский', 'Беларуская'],
    price: 'от 60 BYN за сессию',
    contactsAllowed: true,
    contacts: [
      {
        kind: 'telegram',
        label: 'Telegram',
        value: '@example_anna',
        href: 'https://t.me/example_anna',
      },
      {
        kind: 'email',
        label: 'E-mail',
        value: 'anna@example.com',
        href: 'mailto:anna@example.com',
      },
    ],
  },
  {
    id: 'sergey-petrov',
    visible: true,
    name: 'Сергей Петров',
    specializations: ['Панические атаки', 'Сон', 'Самооценка'],
    quote: 'Паника пугает, но она не опасна — и с ней можно научиться обходиться.',
    description:
      'Специализируюсь на панических атаках и нарушениях сна. Много работаю с медиками и людьми на дежурствах: помогаю восстанавливать режим и снижать тревогу о здоровье.',
    experienceYears: 12,
    approach: ['КПТ', 'ACT'],
    formats: ['online'],
    languages: ['Русский'],
    contactsAllowed: true,
    contacts: [
      {
        kind: 'telegram',
        label: 'Telegram',
        value: '@example_sergey',
        href: 'https://t.me/example_sergey',
      },
    ],
  },
  {
    id: 'maria-kotova',
    visible: true,
    name: 'Мария Котова',
    specializations: ['Отношения', 'Границы', 'Перфекционизм'],
    quote: 'Уметь говорить «нет» — навык, а не черта характера.',
    description:
      'Помогаю выстраивать границы в семье, учёбе и работе, разбираться с перфекционизмом и чувством вины за отдых.',
    experienceYears: 6,
    approach: ['Гештальт-подход'],
    formats: ['online', 'offline'],
    languages: ['Русский'],
    price: 'первая встреча бесплатно',
    contactsAllowed: true,
    contacts: [
      {
        kind: 'booking',
        label: 'Записаться',
        value: 'Форма записи',
        href: 'https://example.com/booking',
      },
    ],
  },
  {
    id: 'dmitry-loginov',
    visible: true,
    name: 'Дмитрий Логинов',
    specializations: ['Депрессивные состояния', 'Утрата', 'Кризисы'],
    quote: 'Иногда самое смелое действие дня — просто попросить о помощи.',
    description:
      'Работаю с длительным упадком сил, утратой и кризисными периодами. Помогаю вернуть опору и постепенно восстанавливать привычную жизнь.',
    experienceYears: 15,
    approach: ['КПТ', 'Экзистенциальный подход'],
    formats: ['offline'],
    languages: ['Русский'],
    contactsAllowed: false,
    contacts: [],
  },
]

export function visibleTherapists(): Therapist[] {
  return THERAPISTS.filter((t) => t.visible)
}

export function findTherapist(id: string): Therapist | undefined {
  return THERAPISTS.find((t) => t.id === id)
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
