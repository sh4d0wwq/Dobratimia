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

В настройках репозитория: **Settings → Pages → Build and deployment → Source → GitHub Actions**  
(не «Deploy from a branch» — иначе публикуется сырой `main` и приложение не открывается).

## Структура

```text
Dobratimia/
└── web/                 # React + TypeScript + Tailwind
    ├── src/             # код приложения
    └── public/          # данные, звуки, 3D-модели
```

Не заменяет профессиональную психологическую помощь.
