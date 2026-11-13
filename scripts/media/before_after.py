#!/usr/bin/env python3
"""До/после для README: одна и та же задача на одной модели — без навыка и с навыком. Ответы сохраняются как есть."""
import json, pathlib, urllib.request, yaml
root = pathlib.Path(__file__).resolve().parents[2]
cfg = yaml.safe_load((root / "evals/promptfooconfig.yaml").read_text(encoding="utf-8"))
pick = ["review-reply #3", "commercial-proposal #1", "claim-reply #1"]
def ask(system, user):
    body = {"messages": [{"role": "system", "content": system}, {"role": "user", "content": user}], "max_tokens": 1500, "temperature": 0.2, "seed": 7}
    r = urllib.request.Request("http://127.0.0.1:8080/v1/chat/completions", json.dumps(body).encode(), {"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(r, timeout=900))["choices"][0]["message"]["content"]
out = []
for t in cfg["tests"]:
    if t["description"] not in pick: continue
    skill_path = (root / "evals" / t["vars"]["skill"].removeprefix("file://")).resolve()
    req = t["vars"]["request"]
    before = ask("Ты — полезный ассистент.", req)
    after = ask("Ты — ассистент с установленным навыком. Строго следуй инструкции навыка ниже.\n\n" + skill_path.read_text(encoding="utf-8"), req)
    out.append({"skill": skill_path.parent.name, "request": req, "before": before, "after": after})
    print(t["description"], len(before), len(after), flush=True)
pathlib.Path("media").mkdir(exist_ok=True)
pathlib.Path("media/before-after.json").write_text(json.dumps({"model": "Qwen3 4B Instruct (локально, llama.cpp)", "items": out}, ensure_ascii=False, indent=1), encoding="utf-8")
