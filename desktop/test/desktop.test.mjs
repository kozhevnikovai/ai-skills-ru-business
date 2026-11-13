import { test, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { crc32 } from "node:zlib";
import { unzip } from "../server/unzip.mjs";

const here = import.meta.dirname;
const tmp = () => mkdtempSync(join(tmpdir(), "kz-"));

/** ZIP без сжатия для тестов */
function makeZip(files) {
  const parts = [], central = [];
  let off = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.from(content), n = Buffer.from(name), crc = crc32(data);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt32LE(crc, 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(n.length, 26);
    parts.push(h, n, data);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt32LE(crc, 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(n.length, 28); c.writeUInt32LE(off, 42);
    central.push(c, n);
    off += 30 + n.length + data.length;
  }
  const cd = Buffer.concat(central), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(central.length / 2, 8); e.writeUInt16LE(central.length / 2, 10); e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, cd, e]);
}

test("распаковка и защита от выхода за папку", () => {
  const d = tmp();
  writeFileSync(join(d, "ok.zip"), makeZip({ "a/b.txt": "привет" }));
  unzip(join(d, "ok.zip"), join(d, "out"));
  assert.equal(readFileSync(join(d, "out/a/b.txt"), "utf8"), "привет");
  writeFileSync(join(d, "bad.zip"), makeZip({ "../evil.txt": "x" }));
  assert.throws(() => unzip(join(d, "bad.zip"), join(d, "out2")), /Недопустимый путь/);
  assert.equal(existsSync(join(d, "evil.txt")), false);
});

// Поддельный продукт: пакет с MCP-сервером, у которого один инструмент echo
const FAKE = `
let b="";process.stdin.setEncoding("utf8");process.stdin.on("data",d=>{b+=d;let i;while((i=b.indexOf("\\n"))>=0){const l=b.slice(0,i);b=b.slice(i+1);if(!l.trim())continue;const m=JSON.parse(l);
const r=x=>process.stdout.write(JSON.stringify({jsonrpc:"2.0",id:m.id,result:x})+"\\n");
if(m.method==="initialize")r({protocolVersion:"2025-06-18",capabilities:{tools:{}},serverInfo:{name:"fake",version:"1"}});
else if(m.method==="tools/list")r({tools:[{name:"audit_sites",description:"fake",inputSchema:{type:"object",properties:{}}}]});
else if(m.method==="tools/call")r({content:[{type:"text",text:"echo:"+JSON.stringify(m.params.arguments)+":"+(process.env.CHROME_PATH||"")+(process.env.SITE_AUDIT_CRUX_KEY?":crux="+process.env.SITE_AUDIT_CRUX_KEY:"")}]});}});`;
const manifest = JSON.stringify({ name: "site-audit-ru", version: "9.9.9", server: { mcp_config: { command: "node", args: ["${__dirname}/fake.mjs"], env: { CHROME_PATH: "${user_config.chrome_path}", SITE_AUDIT_CRUX_KEY: "${user_config.crux_key}" } } } });
const pkg = makeZip({ "manifest.json": manifest, "fake.mjs": FAKE });
const sha = createHash("sha256").update(pkg).digest("hex");

function fakeGithub(digest, tag = "v9.9.9") {
  const srv = createServer((req, res) => {
    const base = `http://127.0.0.1:${srv.address().port}`;
    if (req.url === "/repos/kozhevnikovai/auditor-saitov/releases/latest") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ tag_name: tag, assets: [{ name: "site-audit-ru.mcpb", size: pkg.length, digest, browser_download_url: `${base}/dl` }] }));
    }
    if (req.url === "/dl") { res.writeHead(302, { location: "/file" }); return res.end(); }
    if (req.url === "/file") { res.writeHead(200); return res.end(pkg); }
    res.writeHead(404); res.end("{}");
  });
  return new Promise((ok) => srv.listen(0, "127.0.0.1", () => ok(srv)));
}

function startLoader(api, home, extra = {}) {
  const ch = spawn(process.execPath, [join(here, "../server/index.mjs")], {
    env: { ...process.env, KZ_GITHUB_API: api, KZ_HOME: home, KZ_TEST_ALLOW_HTTP: "1", KZ_PROTOKOLIST: "false", KZ_TENDER: "false", KZ_CHROME_PATH: "C:/chrome.exe", ...extra },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const msgs = [];
  let buf = "", seq = 0;
  const waiters = [];
  ch.stdout.setEncoding("utf8");
  ch.stdout.on("data", (d) => {
    buf += d;
    for (let i; (i = buf.indexOf("\n")) >= 0; ) {
      const m = JSON.parse(buf.slice(0, i));
      buf = buf.slice(i + 1);
      msgs.push(m);
      for (const w of [...waiters]) if (w.test(m)) { waiters.splice(waiters.indexOf(w), 1); w.ok(m); }
    }
  });
  const wait = (test, ms = 15_000) => new Promise((ok, err) => { const f = msgs.find(test); if (f) return ok(f); waiters.push({ test, ok }); setTimeout(() => err(new Error("timeout")), ms); });
  const call = (method, params) => { const id = ++seq; ch.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); return wait((m) => m.id === id); };
  return { ch, call, wait, notify: (method) => ch.stdin.write(JSON.stringify({ jsonrpc: "2.0", method }) + "\n") };
}

const kill = [];
after(() => kill.forEach((f) => f()));

test("ставит продукт из релиза, проверяет SHA-256 и проксирует инструменты; навыки — промпты", async () => {
  const gh = await fakeGithub(`sha256:${sha}`);
  const home = tmp();
  const L = startLoader(`http://127.0.0.1:${gh.address().port}`, home);
  kill.push(() => { L.ch.kill(); gh.close(); });
  const init = await L.call("initialize", { protocolVersion: "2025-06-18", capabilities: {} });
  assert.equal(init.result.capabilities.tools.listChanged, true);
  L.notify("notifications/initialized");
  await L.wait((m) => m.method === "notifications/tools/list_changed");
  const tools = (await L.call("tools/list", {})).result.tools.map((t) => t.name);
  assert.ok(tools.includes("audit_sites") && tools.includes("kozhevnikovai_status"));
  const r = await L.call("tools/call", { name: "audit_sites", arguments: { urls: ["a.ru"] } });
  assert.equal(r.result.content[0].text, 'echo:{"urls":["a.ru"]}:C:/chrome.exe');
  assert.equal(JSON.parse(readFileSync(join(home, "auditor/current.json"), "utf8")).version, "9.9.9");
  const prompts = (await L.call("prompts/list", {})).result.prompts;
  assert.equal(prompts.length, 12);
  assert.ok(prompts.some((x) => x.name === "debt-reminder") && prompts.some((x) => x.name === "claim-reply"));
  const p = await L.call("prompts/get", { name: "review-reply", arguments: { request: "Отзыв ★1" } });
  const text = p.result.messages[0].content.text;
  assert.match(text, /<user_input>\nОтзыв ★1\n<\/user_input>/);
  assert.match(text, /Частые ошибки/);
});

test("подменённый файл не ставится", async () => {
  const gh = await fakeGithub(`sha256:${"0".repeat(64)}`);
  const home = tmp();
  const L = startLoader(`http://127.0.0.1:${gh.address().port}`, home);
  kill.push(() => { L.ch.kill(); gh.close(); });
  await L.call("initialize", {});
  const r = await L.call("tools/call", { name: "kozhevnikovai_install", arguments: { product: "auditor" } });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /Контрольная сумма не совпала/);
  assert.equal(existsSync(join(home, "auditor/current.json")), false);
  const tools = (await L.call("tools/list", {})).result.tools.map((t) => t.name);
  assert.equal(tools.includes("audit_sites"), false);
});

test("релиз без контрольной суммы отклоняется", async () => {
  const gh = await fakeGithub(undefined);
  const L = startLoader(`http://127.0.0.1:${gh.address().port}`, tmp());
  kill.push(() => { L.ch.kill(); gh.close(); });
  await L.call("initialize", {});
  const r = await L.call("tools/call", { name: "kozhevnikovai_install", arguments: { product: "auditor" } });
  assert.match(r.result.content[0].text, /нет контрольной суммы/);
});

import { older } from "../server/products.mjs";
test("сравнение версий", () => {
  assert.equal(older("1.2.0", "1.3.0"), true);
  assert.equal(older("v1.3.0", "1.3.0"), false);
  assert.equal(older("1.10.0", "1.3.0"), false);
  assert.equal(older("2.0.0-beta", "1.3.0"), false);
});

test("ключ CrUX доходит до Аудитора; старая версия в релизе — предупреждение в статусе", async () => {
  const gh = await fakeGithub(`sha256:${sha}`, "v1.2.0");
  const L = startLoader(`http://127.0.0.1:${gh.address().port}`, tmp(), { KZ_CRUX_KEY: "AIzaTestKey1234567890" });
  kill.push(() => { L.ch.kill(); gh.close(); });
  await L.call("initialize", { protocolVersion: "2025-06-18", capabilities: {} });
  L.notify("notifications/initialized");
  await L.wait((m) => m.method === "notifications/tools/list_changed");
  const r = await L.call("tools/call", { name: "audit_sites", arguments: {} });
  assert.match(r.result.content[0].text, /crux=AIzaTestKey1234567890$/);
  const st = await L.call("tools/call", { name: "kozhevnikovai_status", arguments: {} });
  assert.match(st.result.content[0].text, /в релизе версия 1\.2\.0, для всех инструментов нужна 1\.3\.0/);
});
