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

## Структура

```text
Dobratimia/
└── web/                 # React + TypeScript + Tailwind
    ├── src/             # код приложения
    └── public/          # данные, звуки, 3D-модели
```

Не заменяет профессиональную психологическую помощь.
