// Распаковка ZIP (.mcpb) без зависимостей, с защитой от выхода за папку (zip slip)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { inflateRawSync } from "node:zlib";

const MAX_FILES = 50_000;
const MAX_TOTAL = 4 * 1024 ** 3;

export function unzip(file, dest) {
  const buf = readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error("Повреждённый архив: нет оглавления");
  let count = buf.readUInt16LE(eocd + 10);
  let cd = buf.readUInt32LE(eocd + 16);
  if (count === 0xffff || cd === 0xffffffff) {
    // ZIP64
    const loc = eocd - 20;
    if (buf.readUInt32LE(loc) !== 0x07064b50) throw new Error("Повреждённый архив ZIP64");
    const z = Number(buf.readBigUInt64LE(loc + 8));
    count = Number(buf.readBigUInt64LE(z + 32));
    cd = Number(buf.readBigUInt64LE(z + 48));
  }
  if (count > MAX_FILES) throw new Error("Слишком много файлов в архиве");
  const root = resolve(dest);
  let total = 0;
  for (let n = 0, p = cd; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("Повреждённый архив: запись оглавления");
    const method = buf.readUInt16LE(p + 10);
    let csize = buf.readUInt32LE(p + 20);
    let usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    let off = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nlen).replace(/\\/g, "/");
    // ZIP64-поля в extra
    for (let x = p + 46 + nlen; x < p + 46 + nlen + xlen; ) {
      const id = buf.readUInt16LE(x), sz = buf.readUInt16LE(x + 2);
      if (id === 1) {
        let q = x + 4;
        if (usize === 0xffffffff) { usize = Number(buf.readBigUInt64LE(q)); q += 8; }
        if (csize === 0xffffffff) { csize = Number(buf.readBigUInt64LE(q)); q += 8; }
        if (off === 0xffffffff) off = Number(buf.readBigUInt64LE(q));
      }
      x += 4 + sz;
    }
    p += 46 + nlen + xlen + clen;
    const out = resolve(root, name);
    if (name.startsWith("/") || /^[a-z]:/i.test(name) || (out !== root && !out.startsWith(root + sep))) throw new Error(`Недопустимый путь в архиве: ${name}`);
    if (name.endsWith("/")) { mkdirSync(out, { recursive: true }); continue; }
    total += usize;
    if (total > MAX_TOTAL) throw new Error("Архив слишком большой после распаковки");
    if (buf.readUInt32LE(off) !== 0x04034b50) throw new Error("Повреждённый архив: локальный заголовок");
    const start = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    const raw = buf.subarray(start, start + csize);
    const data = method === 0 ? raw : method === 8 ? inflateRawSync(raw, { maxOutputLength: Math.max(usize, 1) }) : null;
    if (!data) throw new Error(`Неподдерживаемое сжатие в ${name}`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, data);
  }
}
