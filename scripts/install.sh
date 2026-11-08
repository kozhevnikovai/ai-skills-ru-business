#!/usr/bin/env bash
# Устанавливает все навыки в каталог навыков агента (по умолчанию Claude Code: ~/.claude/skills)
set -euo pipefail
TARGET="${1:-$HOME/.claude/skills}"
SRC="$(cd "$(dirname "$0")/.." && pwd)/skills"
mkdir -p "$TARGET"
for d in "$SRC"/*/; do
  name="$(basename "$d")"
  rm -rf "$TARGET/$name"
  cp -r "$d" "$TARGET/$name"
  echo "✓ $name"
done
echo "Готово: навыки установлены в $TARGET"
