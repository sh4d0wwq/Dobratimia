export type LoudnessReaction = {
  /** Нижняя граница уровня включительно. */
  min: number
  /** Верхняя граница уровня включительно; null — без ограничения. */
  max: number | null
  title: string
  message: string
  emoji: string
}

/**
 * Порог -> шуточная реакция. Список отсортирован по возрастанию уровня,
 * его можно менять здесь или позже заменить загрузкой из CMS/админки.
 */
export const LOUDNESS_REACTIONS: LoudnessReaction[] = [
  {
    min: 0,
    max: 19,
    title: 'Шёпот',
    message:
      'До крика это ещё не дотягивает. Возможно, вашему голосу просто нужно немного больше уверенности.',
    emoji: '🤫',
  },
  {
    min: 20,
    max: 39,
    title: 'Спокойный голос',
    message:
      'Да, мы услышали ваш голос. Но, судя по всему, ваше психическое состояние пока уравновешено.',
    emoji: '🙂',
  },
  {
    min: 40,
    max: 59,
    title: 'Уверенно',
    message: 'Уже убедительно. Вы явно умеете заявить о себе.',
    emoji: '😌',
  },
  {
    min: 60,
    max: 79,
    title: 'Внутренний зверь',
    message: 'Не сдерживайте своего внутреннего зверя! Вы можете и громче.',
    emoji: '🐯',
  },
  {
    min: 80,
    max: 99,
    title: 'Сосед проснулся',
    message: 'Поздравляем, вы, вероятно, разбудили соседа по комнате.',
    emoji: '😳',
  },
  {
    min: 100,
    max: 119,
    title: 'Мощный крик',
    message: 'Это был мощный крик. Надеемся, рядом не было хрупких предметов.',
    emoji: '🌪️',
  },
  {
    min: 120,
    max: null,
    title: 'Слышно на сервере',
    message: 'Вас было слышно на нашем сервере напрямую.',
    emoji: '🚀',
  },
]

export function reactionForLevel(level: number): LoudnessReaction {
  const rounded = Math.round(level)
  const found = LOUDNESS_REACTIONS.find(
    (r) => rounded >= r.min && (r.max === null || rounded <= r.max),
  )
  return found ?? LOUDNESS_REACTIONS[0]
}

/** Цвет графика и индикаторов растёт вместе с громкостью. */
export function colorForLevel(level: number): string {
  if (level >= 100) return '#dc2626'
  if (level >= 80) return '#ef4444'
  if (level >= 60) return '#f97316'
  if (level >= 40) return '#f59e0b'
  if (level >= 20) return '#10b981'
  return '#34d399'
}
