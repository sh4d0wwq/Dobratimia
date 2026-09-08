# Добратимия

Платформа самодиагностики и самопомощи для студентов медицинских вузов.

## Запуск

```bash
cd web
npm install
npm.cmd run dev
```

Откройте http://localhost:5173

> В PowerShell, если `npm` не работает: используйте `npm.cmd`.

## Сборка

```bash
cd web
npm.cmd run build
npm.cmd run preview
```

## GitHub Pages

Сайт: https://sh4d0wwq.github.io/Dobratimia/

Деплой кладёт сборку в ветку `gh-pages`. В **Settings → Pages** источник должен быть: ветка **gh-pages** / корень (не `main`).

## Что где настраивается

| Что | Файл |
| --- | --- |
| Реакции «КРИКа» по уровням громкости | `web/src/features/scream/loudnessReactions.ts` |
| Шкала условных дБ | `web/src/features/scream/useLoudnessMeter.ts` |
| Контакты и приёмник формы обратной связи | `web/src/data/contacts.ts` |
| Профили специалистов | `web/src/data/therapists.ts` |
| Добрые слова, в том числе от психотерапевтов | `web/src/data/goodword.ts` |
| Счётчик посещений (namespace, провайдеры) | `web/src/lib/visitorCounter.ts` |
| Приёмник аналитики по карточкам | `web/src/lib/therapistAnalytics.ts` |
| Трек фоновой музыки | `web/src/lib/audio.ts` |

Служебные страницы вне навигации: `/stats` — посещения по дням и метрики карточек
специалистов, `/privacy` — политика конфиденциальности.

## Структура

```text
Dobratimia/
└── web/                 # React + TypeScript + Tailwind
    ├── src/             # код приложения
    └── public/          # данные, звуки, 3D-модели
```

Не заменяет профессиональную психологическую помощь.
