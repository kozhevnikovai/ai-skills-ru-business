// Собирает dist/kozhevnikovai.mcpb — общий пакет для Claude Desktop (загрузчик продуктов + навыки как промпты)
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
const dir = "build/desktop";
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
cpSync("desktop/manifest.json", `${dir}/manifest.json`);
cpSync("desktop/server", `${dir}/server`, { recursive: true });
cpSync("desktop/README.md", `${dir}/README.md`);
cpSync("docs/img/icon.png", `${dir}/icon.png`);
cpSync("LICENSE", `${dir}/LICENSE`);
cpSync("skills", `${dir}/skills`, { recursive: true });
mkdirSync("dist", { recursive: true });
execSync(`npx -y @anthropic-ai/mcpb validate ${dir}/manifest.json`, { stdio: "inherit" });
execSync(`npx -y @anthropic-ai/mcpb pack ${dir} dist/kozhevnikovai.mcpb`, { stdio: "inherit" });
