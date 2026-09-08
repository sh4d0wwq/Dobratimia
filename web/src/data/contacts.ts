export type ContactChannel = {
  id: string
  icon: string
  label: string
  value: string
  href: string
  note?: string
}

/** Каналы связи — правятся здесь, пока нет админки. */
export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: 'email',
    icon: '✉️',
    label: 'E-mail',
    value: 'hello@dobratimia.by',
    href: 'mailto:hello@dobratimia.by',
    note: 'Временный адрес — заменим на корпоративный',
  },
  {
    id: 'telegram',
    icon: '💬',
    label: 'Telegram',
    value: '@dobratimia',
    href: 'https://t.me/dobratimia',
    note: 'Заглушка до создания канала',
  },
]

/**
 * Куда уходит форма обратной связи. Пока пусто: форма собирает письмо и
 * открывает почтовый клиент. Когда появится приёмник (почтовый релей,
 * Formspree, Telegram-бот, CRM) — достаточно указать здесь URL, который
 * принимает POST с JSON.
 */
export const CONTACT_FORM_ENDPOINT = ''

export const CONTACT_EMAIL = 'hello@dobratimia.by'

export const CONTACT_SUCCESS_MESSAGE =
  'Спасибо! Мы получили ваше сообщение и ответим, как только сможем'

export const CONTACT_ERROR_MESSAGE =
  'Не удалось отправить сообщение. Попробуйте ещё раз или свяжитесь с нами другим способом'
