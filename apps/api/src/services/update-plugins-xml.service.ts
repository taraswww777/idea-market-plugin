import prisma from "../db.js";

/**
 * Кэш XML с TTL 60s (in-memory, dirty flag).
 */
export interface UpdatePluginsXmlCache {
  xml: string;
  dirty: boolean;
  lastBuilt: Date;
}

const cache = { 
  xml: "", 
  dirty: false, 
  lastBuilt: new Date() 
} as UpdatePluginsXmlCache;

/**
 * Возвращает текущую версию кэша.
 */
export function getCacheVersion(): UpdatePluginsXmlCache {
  return { ...cache };
}

/**
 * Помечает кэш как грязный (нужно пересобрать).
 */
export function markDirty(): void {
  cache.dirty = true;
  console.log("markDirty() called - XML cache marked as dirty, will be rebuilt in background");
}

/**
 * Периодически собирает XML (каждые 60s).
 */
let intervalId: NodeJS.Timeout | null = null;

export function startBackgroundBuild(): void {
  // Собираем XML каждые 60 секунд
  intervalId = setInterval(async () => {
    console.log("Background check for dirty flag...");
    
    if (cache.dirty) {
      try {
        const plugins = await prisma.plugin.findMany({});

        const xml = buildXml(plugins);
        
        cache.xml = xml;
        cache.dirty = false;
        cache.lastBuilt = new Date();
        console.log("Background XML rebuild completed");
      } catch (error) {
        console.error("Background XML rebuild failed:", error);
      }
    } else {
      console.log("Cache is clean, no rebuild needed");
    }
  }, 60 * 1000); // 60 секунд
}

/**
 * Получает (или строит) XML из БД. Использует кэш если не загрязнён или <60s прошло.
 */
export async function getXml(): Promise<string> {
  const now = new Date();
  const elapsedSeconds = (now.getTime() - cache.lastBuilt.getTime()) / 1000;

  // If cache is fresh and not dirty, return cached
  if (!cache.dirty && elapsedSeconds < 60) {
    console.log("Serving XML from cache");
    return cache.xml || buildXmlSync(pluginsFromCacheFallback());
  }

  console.log(`Building XML (cache age: ${elapsedSeconds.toFixed(1)}s, dirty: ${cache.dirty})`);
  const plugins = await prisma.plugin.findMany({});
  return buildXml(plugins);
}

/**
 * Синхронно строит из кэша-заглушки — для случаев когда cache.xml пустой.
 */
function pluginsFromCacheFallback(): any[] {
  // For first request before DB seeding, return empty array → generates empty XML
  return [];
}

function buildXmlSync(plugins: any[]): string {
  const rows = plugins.map(buildPluginXmlRow).join("\r\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\r\n${rows}`;
}

/**
 * Строит XML из списка плагинов (валидация + экскейп).
 */
function buildXml(plugins: any[]): string {
  const rows = plugins.map(buildPluginXmlRow).join("\r\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\r\n${rows}`;
}

/**
 * Строит элемент плагина валидированным. Если поля отсутствуют — пропускает (логгирует ошибку).
 */
function buildPluginXmlRow(plugin: any): string {
  const p = plugin;

  // Validate required fields
  if (!p.id || typeof p.id !== "string") {
    console.error(`Skipping plugin missing id`, p);
    return "";
  }

  if (!p.name || typeof p.name !== "string") {
    console.error(`Skipping plugin ${p.id} missing name`, p);
    return "";
  }

  if (!p.version || typeof p.version !== "string") {
    console.error(`Skipping plugin ${p.id} missing version`, p);
    return "";
  }

  // downloadUrl is required (downloadUrl field in schema)
  if (!p.downloadUrl || !isValidUrl(p.downloadUrl)) {
    console.error(`Skipping plugin ${p.id} missing or invalid downloadUrl:`, p.downloadUrl);
    return "";
  }

  const escapeXml = (text: string): string => {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const id = escapeXml(p.id);
  const name = escapeXml(p.name);
  const version = escapeXml(p.version);
  const url = escapeXml(p.downloadUrl);

  // idea-version element: text is untilBuild ?? sinceBuild, attributes when present
  let ideaVersionEl = "";
  if (p.untilBuild || p.sinceBuild) {
    const iv = escapeXml(p.untilBuild ?? p.sinceBuild);
    const sinceAttr = p.sinceBuild ? ` since-build="${escapeXml(String(p.sinceBuild))}"` : "";
    const untilAttr = p.untilBuild ? ` until-build="${escapeXml(String(p.untilBuild))}"` : "";
    ideaVersionEl = `<idea-version${sinceAttr}${untilAttr}>${iv}</idea-version>`;
  }

  // vendor element: name is text, email/url as attributes
  let vendorEl = "";
  if (p.vendorName) {
    const vname = escapeXml(p.vendorName);
    const vendEmail = p.vendorEmail ? ` email="${escapeXml(String(p.vendorEmail))}"` : "";
    const vendUrl = p.vendorUrl ? ` url="${escapeXml(String(p.vendorUrl))}"` : "";
    vendorEl = `<vendor${vendEmail}${vendUrl}>${vname}</vendor>`;
  }

  // description element (optional)
  let descEl = "";
  if (p.description) {
    const desc = escapeXml(p.description);
    descEl = `  <description>${desc}</description>`;
  }

  // change-notes element (optional)
  let changeNotesEl = "";
  if (p.changeNotes) {
    const cn = escapeXml(p.changeNotes);
    changeNotesEl = `  <change-notes>${cn}</change-notes>`;
  }

  return `<plugin id="${id}">` +
    `  <url>${url}</url>` +
    `  <version>${version}</version>` +
    ideaVersionEl +
    descEl +
    changeNotesEl +
    vendorEl +
    `</plugin>`;
}

/**
 * Проверяет что URL валиден (не пустая строка).
 */
function isValidUrl(url: string): boolean {
  return typeof url === "string" && url.length > 0 && !url.startsWith("javascript:") && !url.startsWith("data:");
}

/**
 * Останавливает фоновую задачу.
 */
export function stopBackgroundBuild(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Background XML build stopped");
  }
}