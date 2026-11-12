// Установка и обновление продукта из релиза GitHub: проверка SHA-256, распаковка, атомарная замена
import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { unzip } from "./unzip.mjs";

export const HOME = process.env.KZ_HOME || join(homedir(), ".kozhevnikovai", "products");
const MAX_BYTES = 2 * 1024 ** 3;
const ALLOWED_HOSTS = /^(api\.github\.com|github\.com|objects\.githubusercontent\.com|release-assets\.githubusercontent\.com|[a-z0-9-]+\.githubusercontent\.com)$/;
const API = process.env.KZ_GITHUB_API || "https://api.github.com";

const stateFile = (id) => join(HOME, id, "current.json");
export function installed(id) {
  try {
    const s = JSON.parse(readFileSync(stateFile(id), "utf8"));
    return existsSync(join(s.dir, "manifest.json")) ? s : null;
  } catch {
    return null;
  }
}

function checkUrl(u) {
  const url = new URL(u);
  if (process.env.KZ_TEST_ALLOW_HTTP !== "1" && (url.protocol !== "https:" || !ALLOWED_HOSTS.test(url.hostname))) throw new Error(`Недопустимый адрес загрузки: ${url.hostname}`);
}

async function get(u, accept) {
  checkUrl(u);
  const r = await fetch(u, { headers: { "user-agent": "kozhevnikovai-desktop", accept }, redirect: "manual", signal: AbortSignal.timeout(60_000) });
  if (r.status >= 300 && r.status < 400 && r.headers.get("location")) return get(new URL(r.headers.get("location"), u).toString(), accept);
  if (!r.ok) throw Object.assign(new Error(`GitHub ответил ${r.status}`), { status: r.status });
  return r;
}

/** Последний релиз и подходящий файл .mcpb с хэшем */
export async function latest(p) {
  const rel = await (await get(`${API}/repos/${p.repo}/releases/latest`, "application/vnd.github+json")).json();
  const re = p.asset();
  const a = (rel.assets || []).find((x) => re.test(x.name));
  if (!a) throw new Error(`В релизе ${rel.tag_name} нет файла для этой системы (${process.platform}-${process.arch})`);
  let sha = /^sha256:([a-f0-9]{64})$/.exec(a.digest || "")?.[1];
  if (!sha) {
    const sums = (rel.assets || []).find((x) => /^SHA256SUMS(\.txt)?$/i.test(x.name));
    if (sums) {
      const txt = await (await get(sums.browser_download_url, "application/octet-stream")).text();
      sha = txt.split(/\r?\n/).map((l) => l.trim().split(/\s+\*?/)).find((x) => x[1] === a.name)?.[0]?.toLowerCase();
    }
  }
  if (!sha || !/^[a-f0-9]{64}$/.test(sha)) throw new Error("У файла релиза нет контрольной суммы SHA-256 — установка отменена");
  return { version: String(rel.tag_name || "").replace(/^v/, ""), url: a.browser_download_url, name: a.name, size: a.size, sha };
}

/** Скачивает и ставит версию; старая удаляется только после успешной установки новой */
export async function install(p, rel, log = () => {}) {
  if (rel.size > MAX_BYTES) throw new Error("Файл релиза слишком большой");
  const base = join(HOME, p.id);
  mkdirSync(base, { recursive: true });
  const tmp = join(base, `.download-${process.pid}`);
  const r = await get(rel.url, "application/octet-stream");
  const hash = createHash("sha256");
  let got = 0;
  const out = createWriteStream(tmp);
  for await (const chunk of r.body) {
    got += chunk.length;
    if (got > MAX_BYTES) { out.destroy(); rmSync(tmp, { force: true }); throw new Error("Файл больше допустимого"); }
    hash.update(chunk);
    if (!out.write(chunk)) await new Promise((ok) => out.once("drain", ok));
    if (rel.size && got % (20 * 1024 * 1024) < chunk.length) log(`${p.title}: ${Math.round((got / rel.size) * 100)} %`);
  }
  await new Promise((ok, err) => out.end((e) => (e ? err(e) : ok())));
  const digest = hash.digest("hex");
  if (digest !== rel.sha) { rmSync(tmp, { force: true }); throw new Error("Контрольная сумма не совпала — файл повреждён или подменён, установка отменена"); }
  const dir = join(base, rel.version.replace(/[^0-9A-Za-z.-]/g, "_"));
  const stage = dir + ".new";
  rmSync(stage, { recursive: true, force: true });
  try {
    unzip(tmp, stage);
  } finally {
    rmSync(tmp, { force: true });
  }
  if (!existsSync(join(stage, "manifest.json"))) { rmSync(stage, { recursive: true, force: true }); throw new Error("В пакете нет manifest.json"); }
  const prev = installed(p.id);
  rmSync(dir, { recursive: true, force: true });
  renameSync(stage, dir);
  writeFileSync(stateFile(p.id), JSON.stringify({ version: rel.version, dir, sha: rel.sha, installedAt: new Date().toISOString() }, null, 2));
  if (prev && prev.dir !== dir) cleanup(p.id);
  return installed(p.id);
}

/** Удаляет старые версии (на Windows занятая папка удалится при следующем запуске) */
export function cleanup(id) {
  const cur = installed(id);
  const base = join(HOME, id);
  if (!cur || !existsSync(base)) return;
  for (const d of readdirSync(base)) {
    const full = join(base, d);
    if (full === cur.dir || d === "current.json") continue;
    try {
      rmSync(full, { recursive: true, force: true });
    } catch {
      /* занято запущенным процессом */
    }
  }
}
