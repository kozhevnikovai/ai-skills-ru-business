<p align="center"><img src="docs/img/cover.png" alt="Бизнес-навыки — ИИ-навыки для бизнеса в России" width="100%"></p>

<p align="center">
<a href="https://github.com/kozhevnikovai/biznes-navyki/releases"><img src="https://img.shields.io/github/v/release/kozhevnikovai/biznes-navyki?color=161616&label=версия" alt="Версия"></a>
<a href="https://github.com/kozhevnikovai/biznes-navyki/actions/workflows/validate.yml"><img src="https://img.shields.io/github/actions/workflow/status/kozhevnikovai/biznes-navyki/validate.yml?label=проверка&color=161616" alt="Проверка"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/лицензия-MIT-161616" alt="MIT"></a>
<a href="README.en.md"><img src="https://img.shields.io/badge/lang-English-FF5A1F" alt="English"></a>
</p>

# Бизнес-навыки — ИИ-навыки для бизнеса в России

**№ 001** · Готовые навыки (Agent Skills) для Claude, Codex и других ИИ-агентов. Делают ежедневную работу российского бизнеса: коммерческие предложения, ответы на отзывы, карточки для Ozon и WB, вакансии для hh.ru, скрипты продаж, регламенты.

- **Бесплатно и с открытым кодом** — лицензия MIT.
- **Под российские реалии** — Яндекс Карты, 2ГИС, Ozon, Wildberries, hh.ru; учитывают 38-ФЗ «О рекламе», 152-ФЗ, ТК РФ.
- **Проверены автотестами** — 30 тестовых задач на качество, соблюдение правил и защиту от посторонних инструкций; запускаются в GitHub Actions.
- **Не выдумывают** цены, кейсы и характеристики: пробелы помечаются `[уточнить]`.

> Навык — это методика, которую агент подгружает сам, когда видит подходящую задачу. Вы пишете «сделай КП для клиента…», а агент работает по проверенной структуре, а не «из головы».

## Навыки

| Навык | Что делает | Пример |
|---|---|---|
| [commercial-proposal](skills/commercial-proposal/SKILL.md) | Коммерческое предложение по брифу | [смотреть](skills/commercial-proposal/references/example.md) |
| [review-reply](skills/review-reply/SKILL.md) | Ответы на отзывы: Яндекс Карты, 2ГИС, Ozon, WB | [смотреть](skills/review-reply/references/example.md) |
| [marketplace-card](skills/marketplace-card/SKILL.md) | Карточка товара для Ozon, WB, Маркета | [смотреть](skills/marketplace-card/references/example.md) |
| [hh-vacancy](skills/hh-vacancy/SKILL.md) | Вакансия для hh.ru и вопросы для собеседования | [смотреть](skills/hh-vacancy/references/example.md) |
| [cold-outreach](skills/cold-outreach/SKILL.md) | Персональное первое письмо и follow-up | [смотреть](skills/cold-outreach/references/example.md) |
| [meeting-to-tasks](skills/meeting-to-tasks/SKILL.md) | Расшифровка встречи → протокол и задачи | [смотреть](skills/meeting-to-tasks/references/example.md) |
| [sop-builder](skills/sop-builder/SKILL.md) | Регламент или инструкция для сотрудников | [смотреть](skills/sop-builder/references/example.md) |
| [call-script](skills/call-script/SKILL.md) | Скрипт звонка с отработкой возражений | [смотреть](skills/call-script/references/example.md) |
| [social-post](skills/social-post/SKILL.md) | Посты для Telegram, ВК, Дзена и контент-план | [смотреть](skills/social-post/references/example.md) |
| [deal-next-step](skills/deal-next-step/SKILL.md) | Разбор переписки с клиентом → следующий шаг | [смотреть](skills/deal-next-step/references/example.md) |

## До и после

**Запрос:** «Ответь на отзыв: "Ждали заказ 40 минут, пицца холодная. Больше не закажем." ★1. Факты: курьер задержался на другом адресе, пиццу не уложили в термосумку. Отвечает администратор Ольга.»

**Без навыка:**
> Уважаемый клиент! Приносим извинения за доставленные неудобства. Ваше мнение очень важно для нас. Мы обязательно примем меры.

**С навыком `review-reply`:**
> Здравствуйте! Холодная пицца после 40 минут ожидания — это не то, за чем вы к нам обращались, извините. Курьер задержался на соседнем адресе, а коробку не уложили в термосумку как положено. С курьерами провели разбор. Напишите нам в сообщения карточки — администратор Ольга свяжется с вами лично.
>
> *Внутреннее действие: проверить укладку в термосумки на вечерних сменах.*

## Установка

**Claude Code** — одной командой:

```bash
git clone https://github.com/kozhevnikovai/biznes-navyki.git && bash biznes-navyki/scripts/install.sh
```

Навыки окажутся в `~/.claude/skills/`. Другая папка: `bash scripts/install.sh /путь/к/skills`.

**Claude (веб, десктоп, мобильное приложение)** — скачайте ZIP нужного навыка в [Releases](https://github.com/kozhevnikovai/biznes-navyki/releases) и загрузите его в разделе навыков (Skills) в настройках Claude.

**Всё сразу в Claude Desktop** — общий пакет `kozhevnikovai.mcpb` со [страницы релизов](https://github.com/kozhevnikovai/biznes-navyki/releases/latest): навыки как команды в меню «+», а также Аудитор сайтов, Протоколист и Тендерный помощник — одной установкой. Подробнее — [desktop/README.md](desktop/README.md).

**Claude Code** — `/plugin marketplace add kozhevnikovai/biznes-navyki`, затем `/plugin install biznes-navyki@kozhevnikovai`.

**Другие агенты** — навыки сделаны по открытому стандарту Agent Skills (папка с `SKILL.md`). Скопируйте папки из `skills/` в каталог навыков вашего агента. Если формат не поддерживается — вставьте текст `SKILL.md` в начало чата как инструкцию.

## Качество

- `scripts/validate.py` — проверка структуры каждого навыка, запускается в CI на каждый коммит.
- `evals/` — 30 автотестов на [promptfoo](https://www.promptfoo.dev/): правило «не выдумывать», защита персональных данных, 38-ФЗ, запрет дискриминации в вакансиях, посторонние инструкции во входных данных для каждого навыка. В GitHub Actions (workflow `evals`) работают без ключа API — на моделях GitHub Models.
- В каждом навыке — разделы «Частые ошибки» и пример результата в `references/example.md`.

```bash
export GITHUB_TOKEN=...   # токен с правом models:read, или поменяйте provider в evals/promptfooconfig.yaml
npx promptfoo@latest eval -c evals/promptfooconfig.yaml
```

## Важно

- Упоминания законов — ориентир для безопасной работы, **а не юридическая консультация**.
- Проверяйте результат перед отправкой клиенту.

## Участие

Нужен навык под вашу задачу? Опишите её в [Issues](https://github.com/kozhevnikovai/biznes-navyki/issues/new/choose) или пришлите PR — см. [CONTRIBUTING.md](CONTRIBUTING.md). История версий — [CHANGELOG.md](CHANGELOG.md).

Если навыки сэкономили вам время — поставьте звезду репозиторию, так их найдут другие.

## Скоро

Всё, что есть сейчас, остаётся бесплатным и открытым (MIT). Платная версия — «Навыки под вашу компанию» — в разработке, этих возможностей пока нет:

- **Отраслевые пакеты** — стоматология, автосервис, общепит, B2B-услуги — *скоро*
- **Навыки под компанию** — тон бренда, прайс, кейсы уже внутри — *скоро*
- **Обучение команды** — как встроить навыки в работу отдела — *скоро*

Цена — по запросу, зависит от отрасли и объёма. Тем, кто оставит заявку на ранний доступ, — скидка 50 % на первый год.

Нужно что-то из этого? [Оставьте заявку на ранний доступ](https://github.com/kozhevnikovai/biznes-navyki/issues/new?template=early-access.yml) — заявки влияют на порядок разработки.

## Другие инструменты kozhevnikovai

- [Протоколист](https://github.com/kozhevnikovai/protokolist) — запись встречи → протокол, локально
- [Тендерный помощник](https://github.com/kozhevnikovai/tender-pomoshnik) — разбор госзакупок 44-ФЗ и 223-ФЗ с цитатами
- [Аудитор сайтов](https://github.com/kozhevnikovai/auditor-saitov) — аудит сайта и конкурентов, 152-ФЗ

Об уязвимостях — приватно, см. [SECURITY.md](SECURITY.md).

## Автор

**Егор Кожевников** — внедряю ИИ в бизнес и делаю open-source инструменты для этого. GitHub: [@kozhevnikovai](https://github.com/kozhevnikovai)

Лицензия [MIT](LICENSE).
