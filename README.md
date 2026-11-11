# Erzkanzler — личный сайт

Одностраничное портфолио инженера-разработчика. Чистый HTML, CSS и немного
ванильного JS: без сборки, фреймворков, аналитики и cookie-баннеров.

**Живёт здесь:** https://erzkanzler.is-a.dev/
**Зеркало:** https://erzkanzler2k.github.io/

Родственный проект: [Erzkanzler Studio](https://studio.erzkanzler.is-a.dev/) — студия вайб-кодинга.

## Структура

```
index.html            разметка и весь контент
assets/css/style.css  оформление, адаптив, reduced-motion, печать
assets/js/main.js     появление секций, подсветка, меню, скролл-прогресс
assets/img/og.jpg     OG-картинка 1200×630
404.html              страница ошибки
favicon.svg           иконка
robots.txt / sitemap.xml / .nojekyll
tests/check.mjs       статические проверки (SEO, доступность, ссылки, ассеты)
SPEC.md               спецификация и критерии приёмки
```

## Секции

1. Hero — имя, роль, оффер, метрики, терминал.
2. Полоса «Сейчас» — чем занят.
3. `#about` — о себе.
4. `#projects` — 6 работ редакционным списком + ссылка на все репозитории.
5. `#skills` — стек тегами по группам.
6. `#approach` — принципы.
7. `#contact` — open-source коллаборация.

## Проверки

```bash
node tests/check.mjs
```

Проверяет: файлы и ассеты, `lang="ru"`, title/description, canonical, Open Graph
с картинкой, JSON-LD `Person`, единственный `h1`, лендмарки, `alt`, якоря,
`rel="noopener"`, отсутствие `http://` и inline-обработчиков, 6 работ,
robots/sitemap/404.

## Что править

Всё в `index.html`:

- **Имя и роль** — `.hero__title`, `.hero__lead`, `JSON-LD` в `<head>`.
- **Метрики** — `.hero__meta`, полоса `.now`.
- **О себе** — `#about`.
- **Работы** — строки `<a class="work">` в `#projects`.
- **Стек** — группы `.tag-groups` в `#skills`.
- **Контакты** — `#contact`.

При смене домена обновите `canonical`, Open Graph, `sitemap.xml`, `robots.txt`
и константу `SITE_URL` в `tests/check.mjs`.

## Локальный запуск

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## Деплой

Репозиторий `Erzkanzler2k.github.io`, ветка `main`, Pages из корня,
кастомный домен `erzkanzler.is-a.dev` (CNAME → `erzkanzler2k.github.io`).

```bash
git add -A && git commit -m "content: ..." && git push
```
