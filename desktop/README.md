# Инструменты kozhevnikovai для Claude Desktop

Одна установка вместо нескольких расширений: [Аудитор сайтов](https://github.com/kozhevnikovai/auditor-saitov), [Протоколист](https://github.com/kozhevnikovai/protokolist), [Тендерный помощник](https://github.com/kozhevnikovai/tender-pomoshnik) и 10 [бизнес-навыков](https://github.com/kozhevnikovai/biznes-navyki).

## Установка

1. Скачайте `kozhevnikovai.mcpb` со [страницы релизов](https://github.com/kozhevnikovai/biznes-navyki/releases/latest).
2. Откройте файл двойным щелчком — Claude Desktop предложит установить расширение.
3. В настройках расширения отметьте нужные продукты. Через минуту-две их инструменты появятся в чате.

## Как это работает

- Продукты скачиваются только из официальных релизов GitHub kozhevnikovai. Перед установкой проверяется контрольная сумма SHA-256 — повреждённый или подменённый файл не ставится.
- Продукты хранятся в папке `.kozhevnikovai/products` в вашей домашней папке. Новая версия ставится рядом и заменяет старую только после успешной проверки.
- Обновления проверяются при запуске Claude (можно выключить в настройках).
- Бизнес-навыки — команды в меню «+» → «Инструменты kozhevnikovai»: выберите навык и опишите задачу.
- Спросите Claude «какие инструменты kozhevnikovai установлены?» — он вызовет `kozhevnikovai_status`.

Протоколист работает на Windows и macOS. Модели распознавания и ИИ Протоколист и Тендерный помощник скачивают при первом использовании.

Если вы уже ставили отдельные расширения продуктов — удалите их, чтобы инструменты не дублировались.

## Claude Code

Навыки ставятся как плагин:

```
/plugin marketplace add kozhevnikovai/biznes-navyki
/plugin install biznes-navyki@kozhevnikovai
```

Аудитор сайтов — `/plugin marketplace add kozhevnikovai/auditor-saitov`.
