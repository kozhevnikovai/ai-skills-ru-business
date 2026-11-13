// Каталог продуктов kozhevnikovai, которые ставит общий пакет
const plat = process.platform === "win32" ? "win" : process.platform === "darwin" ? "mac" : "linux";
export const PRODUCTS = [
  { id: "auditor", title: "Аудитор сайтов", repo: "kozhevnikovai/auditor-saitov", asset: () => /^site-audit-ru\.mcpb$/, config: { chrome_path: "KZ_CHROME_PATH", crux_key: "KZ_CRUX_KEY" }, min: "1.3.0" },
  { id: "protokolist", title: "Протоколист", repo: "kozhevnikovai/protokolist", asset: () => new RegExp(`^protokolist-${plat}-${process.arch}\\.mcpb$`), config: { output_dir: "KZ_PROTOKOLIST_OUT" }, platforms: ["win32", "darwin"], min: "1.3.0" },
  { id: "tender", title: "Тендерный помощник", repo: "kozhevnikovai/tender-pomoshnik", asset: () => new RegExp(`^tender-pomoshnik-${plat}-${process.arch}\\.mcpb$`), config: { output_dir: "KZ_TENDER_OUT" }, min: "1.3.0" },
];

/** a < b по SemVer (только числа major.minor.patch; «v» в начале и суффиксы игнорируются) */
export function older(a, b) {
  const n = (v) => String(v || "0").replace(/^v/, "").split(/[.-]/).slice(0, 3).map((x) => Number.parseInt(x, 10) || 0);
  const [x, y] = [n(a), n(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i];
  return false;
}
