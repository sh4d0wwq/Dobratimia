import { Link } from 'react-router-dom'
import { CONTACT_CHANNELS } from '@/data/contacts'

export function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-8 md:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-3">
        <section>
          <h3 className="text-sm font-semibold">Связаться с нами</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {CONTACT_CHANNELS.map((channel) => (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="text-muted transition hover:text-primary-dark"
                >
                  {channel.icon} {channel.value}
                </a>
              </li>
            ))}
            <li>
              <Link to="/contacts" className="font-medium text-primary-dark hover:underline">
                Форма обратной связи →
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Полезное</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/resources" className="transition hover:text-primary-dark">
                🆘 Куда обратиться за помощью
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition hover:text-primary-dark">
                ℹ️ О проекте
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition hover:text-primary-dark">
                🔒 Политика конфиденциальности
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Добратимия</h3>
          <p className="mt-3 text-sm text-muted">
            Территория гармонии для студентов-медиков. Платформа не заменяет профессиональную
            помощь — при кризисе звоните{' '}
            <a href="tel:133" className="font-bold text-danger">
              133
            </a>
            .
          </p>
        </section>
      </div>
    </footer>
  )
}
