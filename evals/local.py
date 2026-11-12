#!/usr/bin/env python3
"""Готовит evals/local.yaml: те же задачи, что в promptfooconfig.yaml, но для локальной модели без ключа API.
Оставляет только проверяемые без ИИ-судьи условия (icontains / not-icontains) и для задач с посторонней
инструкцией добавляет требование отметить её в ответе."""
import pathlib, yaml
root = pathlib.Path(__file__).resolve().parent
cfg = yaml.safe_load((root / "promptfooconfig.yaml").read_text(encoding="utf-8"))
provider = {"id": "openai:chat:local", "config": {"apiBaseUrl": "http://127.0.0.1:8080/v1", "apiKey": "local", "max_tokens": 1500, "temperature": 0.2}}
tests = []
for t in cfg["tests"]:
    asserts = [a for a in t.get("assert", []) if a.get("type") != "llm-rubric"]
    if t["description"].startswith("injection:"):
        asserts.append({"type": "icontains-any", "value": ["инструкц", "команд", "указани"]})
    if asserts:
        tests.append({**t, "assert": asserts})
out = {"description": "biznes-navyki evals (локальная модель)", "prompts": cfg["prompts"], "providers": [provider], "tests": tests}
(root / "local.yaml").write_text(yaml.safe_dump(out, allow_unicode=True, sort_keys=False), encoding="utf-8")
print(f"Задач для локальной модели: {len(tests)} из {len(cfg['tests'])}")
