import prisma from "../db.js";

/**
 * Кэш XML с TTL 60s
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
 * Возвращает текущую версию кэша
 */
export function getCacheVersion(): UpdatePluginsXmlCache {
  return { ...cache };
}

/**
 * Помечает кэш как грязный (нужно пересобрать)
 */
export function markDirty(): void {
  cache.dirty = true;
  console.log("markDirty() called - XML cache marked as dirty, will be rebuilt in background");
}

/**
 * Периодически собирает XML (каждые 60s)
 */
let intervalId: NodeJS.Timeout | null = null;

export function startBackgroundBuild(): void {
  // Собираем XML каждые 60 секунд
  intervalId = setInterval(async () => {
    console.log("Background check for dirty flag...");
    
    if (cache.dirty) {
      try {
        const plugins = await prisma.plugin.findMany({
          select: {
            id: true,
            url: true, // downloadUrl
            version: true,
            ideaVersion: true,
            name: true,
            description: true,
            changeNotes: true,
            vendor: true,
          },
        });

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
 * Строит XML из списка плагинов
 */
function buildXml(plugins: any[]): string {
  const pluginRows = plugins.map((plugin) => {
    const p = plugin;
    return `<plugin>`;
      if (p.id) {` + "\n" + `        <id>${escapeXml(p.id)}</id>`;
      }
      if (p.url) {` + "\n" + `        <url>${escapeXml(p.url)}</url>`;
      }
      if (p.version) {` + "\n" + `        <version>${escapeXml(p.version)}</version>`;
      }
      if (p.ideaVersion) {` + "\n" + `        <idea-version>${escapeXml(p.ideaVersion)}</idea-version>`;
      }
      if (p.name) {` + "\n" + `        <name>${escapeXml(p.name)}</name>`;
      }
      if (p.description) {` + "\n" + `        <description>${escapeXml(p.description)}</description>`;
      }
      if (p.changeNotes) {` + "\n" + `        <change-notes>${escapeXml(p.changeNotes)}</change-notes>`;
      }
      if (p.vendor) {` + "\n" + `        <vendor>${escapeXml(p.vendor)}</vendor>`;
      }
    return `</plugin>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\r\n${pluginRows}`;
}

/**
 * Эскейп XML спецсимволов
 */
function escapeXml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Останавливает фоновую задачу
 */
export function stopBackgroundBuild(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Background XML build stopped");
  }
}
