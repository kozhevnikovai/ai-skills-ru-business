// Каталог продуктов kozhevnikovai, которые ставит общий пакет
const plat = process.platform === "win32" ? "win" : process.platform === "darwin" ? "mac" : "linux";
export const PRODUCTS = [
  { id: "auditor", title: "Аудитор сайтов", repo: "kozhevnikovai/auditor-saitov", asset: () => /^site-audit-ru\.mcpb$/, config: { chrome_path: "KZ_CHROME_PATH" } },
  { id: "protokolist", title: "Протоколист", repo: "kozhevnikovai/protokolist", asset: () => new RegExp(`^protokolist-${plat}-${process.arch}\\.mcpb$`), config: { output_dir: "KZ_PROTOKOLIST_OUT" }, platforms: ["win32", "darwin"] },
  { id: "tender", title: "Тендерный помощник", repo: "kozhevnikovai/tender-pomoshnik", asset: () => new RegExp(`^tender-pomoshnik-${plat}-${process.arch}\\.mcpb$`), config: { output_dir: "KZ_TENDER_OUT" } },
];
