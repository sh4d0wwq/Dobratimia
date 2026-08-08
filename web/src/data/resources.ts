export type ResourcePhone = {
  label?: string
  phone: string
  href: string
}

export type ResourceItem = {
  title: string
  content?: string
  phone?: string
  href?: string
  phones?: ResourcePhone[]
}

export type ResourceBlock = {
  title: string
  items: ResourceItem[]
}

export const RESOURCES: ResourceBlock[] = [
  {
    title: '📞 Экстренная помощь',
    items: [
      {
        title: '📞 Круглосуточная служба',
        phone: '133',
        href: 'tel:133',
      },
      {
        title: '📞 Телефон доверия РНПЦ психического здоровья',
        content: 'Минск',
        phone: '+375 17 272-21-67',
        href: 'tel:+375172722167',
      },
      {
        title: '📞 Республиканская «Детская телефонная линия»',
        content: 'круглосуточно',
        phone: '8-801-100-1611',
        href: 'tel:88011001611',
      },
    ],
  },
  {
    title: '🏥 Психологические службы',
    items: [
      {
        title: '🏥 Психологическая служба ВГМУ',
        content: '📍 Располагается в общежитии №4 ВГМУ',
        phones: [
          {
            label: 'Педагог-психолог',
            phone: '+375 212 22 14 31',
            href: 'tel:+375212221431',
          },
          {
            label: 'Педагог социальный',
            phone: '+375 212 24 60 74',
            href: 'tel:+375212246074',
          },
        ],
      },
      {
        title: 'Витебский ЦЗМ',
        content: '📍 ул. Чкалова, 14 В, г. Витебск',
        phone: '8 0212 57-24-71',
        href: 'tel:80212572471',
      },
      {
        title: 'Круглосуточная помощь, г. Витебск',
        phone: '8 0212 61-60-60',
        href: 'tel:80212616060',
      },
    ],
  },
  {
    title: '📱 Приложения',
    items: [
      { title: '🧘 Headspace', content: 'Медитации и техники осознанности' },
      { title: '😴 Calm', content: 'Релаксация и улучшение сна' },
      { title: '📊 MoodTools', content: 'Инструменты КПТ' },
      { title: 'B17', content: 'Поможет найти персонального психолога' },
    ],
  },
  {
    title: '📚 Литература',
    items: [
      { title: '📖 «Паническая атака и невроз сердца»', content: 'А.В. Курпатов' },
      { title: '📖 «Стресс, выгорание, совладание»', content: 'А.Л. Журавлев' },
      { title: '📖 «Психология медицинского работника»', content: 'Е.А. Назаренко' },
    ],
  },
]
