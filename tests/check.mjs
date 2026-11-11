#!/usr/bin/env node
// Статические проверки сайта: структура, SEO, ссылки, доступность, ассеты.
// Без зависимостей. Код возврата 1, если есть хоть одна ошибка.
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://erzkanzler.is-a.dev/";
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");

let failed = 0;
const ok = (name) => console.log(`  \x1b[32m✓\x1b[0m ${name}`);
const bad = (name, detail) => {
  failed++;
  console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
};
const check = (name, cond, detail) => (cond ? ok(name) : bad(name, detail));

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

if (!existsSync(resolve(ROOT, "index.html"))) {
  console.log("\x1b[31mindex.html отсутствует — нечего проверять.\x1b[0m");
  process.exit(1);
}

const html = read("index.html");
const decode = (s) =>
  s.replace(/&laquo;/g, "«").replace(/&raquo;/g, "»").replace(/&mdash;/g, "—").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");

section("Файлы и ассеты");
const requiredFiles = [
  "index.html", "404.html", "robots.txt", "sitemap.xml", ".nojekyll",
  "assets/css/style.css", "assets/js/main.js", "favicon.svg", "README.md",
];
for (const f of requiredFiles) check(`есть ${f}`, existsSync(resolve(ROOT, f)));

const refs = [...html.matchAll(/(?:href|src)="((?:\/)?(?:assets|favicon)[^"#?]*)"/g)].map((m) => m[1]);
check("в разметке есть ссылки на локальные ассеты", refs.length >= 3);
for (const ref of [...new Set(refs)]) {
  const p = ref.replace(/^\//, "").split("?")[0];
  check(`ассет существует: ${ref}`, existsSync(resolve(ROOT, p)));
}
for (const f of ["assets/css/style.css", "assets/js/main.js"]) {
  if (existsSync(resolve(ROOT, f))) check(`${f} не пустой`, statSync(resolve(ROOT, f)).size > 500);
}

section("Язык, заголовки, SEO");
check('lang="ru"', /<html[^>]+lang="ru"/.test(html));
check("viewport", /<meta[^>]+name="viewport"/.test(html));
check("theme-color", /<meta[^>]+name="theme-color"/.test(html));

const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
check(`title задан и по длине (${title.length})`, title.length >= 15 && title.length <= 70, title);

const desc = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/) || [])[1] || "";
const descLen = decode(desc).length;
check(`description задан и по длине (${descLen})`, descLen >= 60 && descLen <= 170);
check("canonical", html.includes(`<link rel="canonical" href="${SITE_URL}"`));
for (const prop of ["og:title", "og:description", "og:type", "og:locale", "og:site_name"]) {
  check(prop, new RegExp(`property="${prop}"`).test(html));
}
check("og:locale = ru_RU", /property="og:locale"[^>]+content="ru_RU"/.test(html));
check("twitter:card", /name="twitter:card"/.test(html));
const ogImage = (html.match(/property="og:image" content="([^"]+)"/) || [])[1] || "";
check("og:image — абсолютный URL", /^https:\/\/erzkanzler\.is-a\.dev\//.test(ogImage), ogImage);
check("og:image существует в репозитории", ogImage && existsSync(resolve(ROOT, ogImage.replace(SITE_URL, ""))));
check("og:image:width/height", /og:image:width" content="1200"/.test(html) && /og:image:height" content="630"/.test(html));
check("twitter:card = summary_large_image", /name="twitter:card" content="summary_large_image"/.test(html));

const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
check(`ровно один h1 (${h1s})`, h1s === 1);

const jsonld = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
let parsed = null;
try { parsed = JSON.parse(jsonld); } catch { /* ниже */ }
check("JSON-LD корректный JSON", !!parsed);
check('JSON-LD @type = Person', parsed && parsed["@type"] === "Person");
check("JSON-LD alternateName задан", parsed && !!parsed.alternateName);
check("JSON-LD url указывает на сайт", parsed && parsed.url === SITE_URL);
check("JSON-LD sameAs → GitHub", parsed && JSON.stringify(parsed.sameAs || []).includes("github.com/Erzkanzler2k"));

section("Структура и доступность");
for (const tag of ["header", "nav", "main", "footer", "section"]) {
  check(`есть <${tag}>`, new RegExp(`<${tag}[\\s>]`).test(html));
}
check("skip-link на #main", /class="skip-link"[^>]+href="#main"/.test(html) && /id="main"/.test(html));
check("меню имеет aria-label", /<nav[^>]+aria-label="[^"]+"/.test(html));
check("есть aria-hidden у декоративных слоёв", /aria-hidden="true"/.test(html));
check("кнопка мобильного меню с aria-expanded", /aria-expanded="false"/.test(html));
check("aria-label на pre только с явной ролью", !/<pre(?![^>]*role=)[^>]*aria-label=/.test(html));

const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
check("у всех img есть alt", imgs.every((t) => /\balt="/.test(t)), `${imgs.filter((t) => !/alt="/.test(t)).length} без alt`);

section("Ссылки");
const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const inPage = hrefs.filter((h) => h.startsWith("#"));
for (const h of [...new Set(inPage)]) {
  check(`якорь ${h} ведёт к существующему id`, new RegExp(`id="${h.slice(1)}"`).test(html));
}
const external = hrefs.filter((h) => /^https?:\/\//.test(h));
check("нет внешних http:// (только https)", !external.some((h) => h.startsWith("http://")));
check("все внешние ссылки — https", external.every((h) => h.startsWith("https://")));

const blank = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((m) => m[0]);
check("target=_blank с rel=noopener", blank.every((t) => /rel="[^"]*noopener/.test(t)), `${blank.filter((t) => !/noopener/.test(t)).length} без rel`);
check("нет inline-обработчиков (onclick и т.п.)", !/\son(click|load|error|mouseover)=/i.test(html));

section("Контент");
const cards = [...html.matchAll(/<a class="work"/g)].length;
check(`карточек проектов ≥ 6 (${cards})`, cards >= 6);
const ghLinks = [...html.matchAll(/https:\/\/github\.com\/Erzkanzler2k\/([A-Za-z0-9._-]+)/g)].map((m) => m[1]);
check("ссылки на GitHub-проекты", new Set(ghLinks).size >= 6, `уникальных: ${new Set(ghLinks).size}`);
check("нет lorem ipsum", !/lorem\s+ipsum/i.test(html));
check("нет незаполненных плейсхолдеров", !/\{\{|\bTODO\b|TODO:/i.test(html));
check("есть секции #about #projects #skills #contact", ["about", "projects", "skills", "contact"].every((id) => html.includes(`id="${id}"`)));
check("в списке работ есть ссылка на все репозитории", html.includes("?tab=repositories"));

section("Инфраструктура деплоя");
check("robots.txt ссылается на sitemap", read("robots.txt").includes(`Sitemap: ${SITE_URL}sitemap.xml`));
check("robots.txt не запрещает индексацию", !/Disallow:\s*\/\s*$/m.test(read("robots.txt")));
const sitemap = read("sitemap.xml");
check("sitemap содержит продовый URL", sitemap.includes(`<loc>${SITE_URL}</loc>`));
check("sitemap валидный XML-каркас", /<urlset[\s\S]*<\/urlset>/.test(sitemap));
check("404.html ведёт на главную", /href="\/"/.test(read("404.html")));

console.log(failed === 0 ? "\n\x1b[32mВСЕ ПРОВЕРКИ ЗЕЛЁНЫЕ\x1b[0m\n" : `\n\x1b[31mПРОВАЛЕНО: ${failed}\x1b[0m\n`);
process.exit(failed === 0 ? 0 : 1);
