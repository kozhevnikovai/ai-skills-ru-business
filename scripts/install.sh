#!/usr/bin/env bash
# Устанавливает все навыки в каталог навыков агента (по умолчанию Claude Code: ~/.claude/skills)
set -euo pipefail
TARGET="${1:-$HOME/.claude/skills}"
SRC="$(cd "$(dirname "$0")/.." && pwd)/skills"
mkdir -p "$TARGET"
for d in "$SRC"/*/; do
  name="$(basename "$d")"
  if [ -e "$TARGET/$name" ] && ! diff -rq "$d" "$TARGET/$name" >/dev/null 2>&1; then
    # у вас уже есть навык с таким именем и другим содержанием — сохраняем копию, а не затираем
    backup="$TARGET/$name.backup-$(date +%Y%m%d-%H%M%S)"
    mv "$TARGET/$name" "$backup"
    echo "  ↪ прежняя версия $name сохранена: $backup"
  fi
  rm -rf "$TARGET/$name"
  cp -r "$d" "$TARGET/$name"
  echo "✓ $name"
done
echo "Готово: навыки установлены в $TARGET"
