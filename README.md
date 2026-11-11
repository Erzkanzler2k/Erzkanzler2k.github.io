# Erzkanzler Studio — лендинг студии вайб-кодинга

Одностраничный сайт студии. Чистый HTML, CSS и немного ванильного JS:
без сборки, фреймворков, аналитики и cookie-баннеров.

**Живёт здесь:** https://erzkanzler2k.github.io/

## Структура

```
index.html            разметка и весь контент
assets/css/style.css  оформление, адаптив, reduced-motion, печать
assets/js/main.js     появление секций, подсветка карточек, меню, скролл-прогресс
404.html              страница ошибки (GitHub Pages отдаёт её автоматически)
favicon.svg           иконка
assets/img/og.jpg     OG-картинка 1200×630 для соцсетей
robots.txt / sitemap.xml / .nojekyll
tests/check.mjs       статические проверки (SEO, доступность, ссылки, ассеты)
SPEC.md               спецификация и критерии приёмки
```

## Секции

1. Hero — оффер, метрики, «терминал» с процессом студии.
2. `#about` — о студии.
3. `#services` — 6 услуг.
4. `#projects` — 6 работ со ссылками на GitHub.
5. `#process` — 4 шага со сроками.
6. `#skills` — инструменты.
7. `#approach` — принципы.
8. `#faq` — 6 вопросов на нативных `<details>`.
9. `#contact` — призыв к действию и канал связи.

## Проверки

```bash
node tests/check.mjs
```

Проверяет: наличие файлов и ассетов, `lang="ru"`, длину title/description,
canonical, Open Graph, JSON-LD (`ProfessionalService`), единственный `h1`,
лендмарки, `alt`, разрешимость внутренних якорей, `rel="noopener"` у внешних
ссылок, отсутствие `http://` и inline-обработчиков, ≥6 карточек работ,
секции, FAQ, robots/sitemap/404.

## Что править

Всё в одном файле — `index.html`:

- **Название студии** — `.brand`, `.hero__title`, футер, `JSON-LD` в `<head>`.
- **Оффер и метрики** — `.hero__lead`, `.hero__meta`.
- **Услуги** — секция `#services` (`.service-card`).
- **Работы** — `<a class="project-card">`: `href`, `h3`, описание, чипы.
- **Сроки процесса** — `.badge` в `#process`.
- **FAQ** — блоки `<details>` в `#faq`.
- **Контакты** — `#contact` (сейчас единственный канал — GitHub; добавьте
  почту/Telegram, если появится).

После правок при смене домена обновите `canonical`, Open Graph, `sitemap.xml`,
`robots.txt` и `tests/check.mjs` (константа `SITE_URL`).

## Локальный запуск

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## Деплой

Репозиторий `Erzkanzler2k.github.io`, ветка `main`, GitHub Pages из корня.
Любой push в `main` публикует изменения в течение минуты:

```bash
git add -A && git commit -m "content: ..." && git push
```

`.nojekyll` отключает обработку Jekyll — статика отдаётся как есть.
