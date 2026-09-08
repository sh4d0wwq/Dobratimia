import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  CONTACT_CHANNELS,
  CONTACT_EMAIL,
  CONTACT_ERROR_MESSAGE,
  CONTACT_FORM_ENDPOINT,
  CONTACT_SUCCESS_MESSAGE,
} from '@/data/contacts'

type Status = 'idle' | 'sending' | 'success' | 'error'

type Form = {
  name: string
  reply: string
  subject: string
  message: string
  consent: boolean
}

const EMPTY_FORM: Form = { name: '', reply: '', subject: '', message: '', consent: false }

const inputClass =
  'w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-emerald-100 focus:outline-none'

/** Без бэкенда письмо собирается на клиенте и открывается в почтовом клиенте. */
function openMailClient(form: Form) {
  const subject = form.subject.trim() || 'Обращение с сайта Добратимии'
  const body = [
    `Имя: ${form.name.trim()}`,
    `Обратная связь: ${form.reply.trim()}`,
    '',
    form.message.trim(),
  ].join('\n')
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`
}

export function ContactsPage() {
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [status, setStatus] = useState<Status>('idle')

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const canSubmit =
    Boolean(form.name.trim()) &&
    Boolean(form.reply.trim()) &&
    Boolean(form.message.trim()) &&
    form.consent &&
    status !== 'sending'

  const submit = async () => {
    if (!canSubmit) return
    setStatus('sending')

    if (!CONTACT_FORM_ENDPOINT) {
      openMailClient(form)
      setStatus('success')
      return
    }

    try {
      const res = await fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          reply: form.reply.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="✉️ Связаться с нами"
        subtitle="Расскажите, что улучшить, что не работает или как вы хотите помочь проекту."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {CONTACT_CHANNELS.map((channel) => (
          <a
            key={channel.id}
            href={channel.href}
            target={channel.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="text-2xl">{channel.icon}</span>
            <p className="mt-2 text-sm text-muted">{channel.label}</p>
            <p className="font-semibold text-primary-dark">{channel.value}</p>
            {channel.note && <p className="mt-1 text-xs text-muted">{channel.note}</p>}
          </a>
        ))}
      </div>

      <Card className="mt-6">
        {status === 'success' ? (
          <div className="py-6 text-center">
            <span className="text-5xl">🌿</span>
            <p className="mt-4 text-lg font-semibold text-primary-dark">
              {CONTACT_SUCCESS_MESSAGE}
            </p>
            <Button
              className="mt-6"
              onClick={() => {
                setForm(EMPTY_FORM)
                setStatus('idle')
              }}
            >
              Написать ещё
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <h3 className="font-semibold">Короткая форма обратной связи</h3>

            <label className="block">
              <span className="text-sm font-medium">Имя</span>
              <input
                className={`mt-1 ${inputClass}`}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Как к вам обращаться"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">E-mail или Telegram для ответа</span>
              <input
                className={`mt-1 ${inputClass}`}
                value={form.reply}
                onChange={(e) => update('reply', e.target.value)}
                placeholder="you@example.com или @nickname"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">
                Тема обращения <span className="text-muted">— необязательно</span>
              </span>
              <input
                className={`mt-1 ${inputClass}`}
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                placeholder="Например: не работает раздел «Крик»"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Сообщение</span>
              <textarea
                rows={6}
                className={`mt-1 resize-y ${inputClass}`}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="Опишите вопрос или идею"
              />
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update('consent', e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
              />
              <span>
                Согласен(на) на обработку персональных данных в соответствии с{' '}
                <Link to="/privacy" className="font-medium text-primary-dark underline">
                  политикой конфиденциальности
                </Link>
              </span>
            </label>

            {status === 'error' && (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                {CONTACT_ERROR_MESSAGE}
              </p>
            )}

            <Button onClick={() => void submit()} disabled={!canSubmit} className="w-full sm:w-auto">
              {status === 'sending' ? 'Отправляем…' : '📨 Отправить'}
            </Button>

            {!CONTACT_FORM_ENDPOINT && (
              <p className="text-xs text-muted">
                Пока приём заявок не подключён: кнопка откроет ваш почтовый клиент с готовым
                письмом на {CONTACT_EMAIL}.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
