#!/usr/bin/env python3
"""Проверяет навыки: frontmatter, имя = папка, длина description, обязательные разделы, пример в references/, раздел «Частые ошибки»."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
errors = []
skills = sorted(p for p in (root / "skills").iterdir() if p.is_dir())
for d in skills:
    f = d / "SKILL.md"
    if not f.exists():
        errors.append(f"{d.name}: нет SKILL.md"); continue
    text = f.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        errors.append(f"{d.name}: нет frontmatter"); continue
    fm = dict(l.split(": ", 1) for l in m.group(1).splitlines() if ": " in l)
    name, desc = fm.get("name", ""), fm.get("description", "")
    if name != d.name: errors.append(f"{d.name}: name '{name}' не совпадает с папкой")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name) or len(name) > 64: errors.append(f"{d.name}: недопустимое name")
    if not 50 <= len(desc) <= 1024: errors.append(f"{d.name}: description {len(desc)} символов (нужно 50–1024)")
    if "Используй" not in desc: errors.append(f"{d.name}: в description нет «Используй, когда…»")
    if "Формат ответа" not in text: errors.append(f"{d.name}: нет раздела «Формат ответа»")
    if "## Безопасность входных данных" not in text: errors.append(f"{d.name}: нет раздела «Безопасность входных данных»")
    if "## Чек-лист перед выдачей" not in text: errors.append(f"{d.name}: нет раздела «Чек-лист перед выдачей»")
    if "## Частые ошибки" not in text: errors.append(f"{d.name}: нет раздела «Частые ошибки»")
    if not (d / "references" / "example.md").exists(): errors.append(f"{d.name}: нет references/example.md")
    if "references/example.md" not in text: errors.append(f"{d.name}: SKILL.md не ссылается на references/example.md")
    if len(text.split()) > 5000: errors.append(f"{d.name}: SKILL.md длиннее 5000 слов")
    if d.name not in (root / "README.md").read_text(encoding="utf-8"): errors.append(f"{d.name}: нет в README.md")
    if d.name not in (root / "README.en.md").read_text(encoding="utf-8"): errors.append(f"{d.name}: нет в README.en.md")
print(f"Навыков: {len(skills)}")
for e in errors: print("✗", e)
sys.exit(1 if errors else 0)
