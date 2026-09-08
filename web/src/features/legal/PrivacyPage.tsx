import { PageHeader } from '@/components/ui/PageHeader'
import { CONTACT_EMAIL } from '@/data/contacts'

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="🔒 Политика конфиденциальности" subtitle="Коротко и без юридического тумана" />

      <div className="space-y-4 rounded-2xl bg-white p-6 text-sm leading-relaxed shadow-md">
        <section>
          <h3 className="font-semibold">Что мы не собираем</h3>
          <p className="mt-1 text-muted">
            Результаты DASS-21, дневник настроения, тексты из раздела «Крик» и настройки хранятся
            только в вашем браузере и не отправляются на сервер. Голос в «Крике» не записывается:
            анализируется только уровень громкости в реальном времени.
          </p>
        </section>

        <section>
          <h3 className="font-semibold">Что собираем</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
            <li>
              Обезличенный счётчик посещений за день — без IP-адресов и идентификаторов
              пользователей.
            </li>
            <li>
              Данные, которые вы сами указали в форме обратной связи: имя, контакт для ответа, тема
              и текст сообщения.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold">Зачем нужны данные из формы</h3>
          <p className="mt-1 text-muted">
            Только чтобы ответить вам и учесть замечания по работе платформы. Мы не передаём их
            третьим лицам и не используем для рекламы.
          </p>
        </section>

        <section>
          <h3 className="font-semibold">Как удалить свои данные</h3>
          <p className="mt-1 text-muted">
            Локальные данные удаляются очисткой данных сайта в браузере. Чтобы удалить обращение,
            отправленное через форму, напишите на{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary-dark underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <p className="rounded-xl bg-amber-50 p-3 text-amber-900">
          ⚠️ Платформа не оказывает медицинских услуг и не заменяет консультацию специалиста.
        </p>
      </div>
    </div>
  )
}
