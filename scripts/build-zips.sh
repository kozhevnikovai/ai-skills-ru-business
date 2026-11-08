#!/usr/bin/env bash
# Собирает ZIP каждого навыка в dist/ — для загрузки в Claude (веб/десктоп) и для GitHub Releases
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/dist" && rm -f "$ROOT/dist"/*.zip
cd "$ROOT/skills"
for d in */; do n="${d%/}"; zip -qr "$ROOT/dist/$n.zip" "$n"; echo "✓ dist/$n.zip"; done
