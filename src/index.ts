import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { parse, HTMLElement } from "node-html-parser";
import { URL } from "url";

interface UrlInfo {
  lastmod: string;
  priority: string;
}

interface CrawlQueueItem {
  url: string;
  depth: number;
}

interface GenerateOptions {
  baseUrl: string;
  outDir: string;
  maxDepth: number;
  disallowPaths: string[];
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

function fetchPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function crawlSite(
  baseUrl: string,
  maxDepth: number = 5
): Promise<Map<string, UrlInfo>> {
  const visited = new Map<string, UrlInfo>();
  const queue: CrawlQueueItem[] = [{ url: baseUrl, depth: 0 }];
  const baseUrlObj = new URL(baseUrl);

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    const { url, depth } = item;
    if (visited.has(url) || depth > maxDepth) continue;

    try {
      console.log(`Crawling: ${url}`);
      const html = await fetchPage(url);
      const root = parse(html);
      const lastMod =
        root
          .querySelector('meta[name="last-modified"]')
          ?.getAttribute("content") || new Date().toISOString();
      visited.set(url, {
        lastmod: lastMod,
        priority: (1.0 - depth * 0.1).toFixed(2),
      });

      const links = root
        .querySelectorAll("a")
        .map((a: HTMLElement) => {
          try {
            return new URL(a.getAttribute("href") || "", url).href;
          } catch {
            return null;
          }
        })
        .filter((href): href is string => !!href && href.startsWith(baseUrl));

      for (const link of links) {
        if (!visited.has(link)) {
          queue.push({ url: link, depth: depth + 1 });
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
    }
  }

  return visited;
}

function generateSitemap(urlMap: Map<string, UrlInfo>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const [url, { lastmod, priority }] of urlMap) {
    xml += "  <url>\n";
    xml += `    <loc>${escapeXml(url)}</loc>\n`;
    xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
    xml += `    <priority>${escapeXml(priority)}</priority>\n`;
    xml += "  </url>\n";
  }
  xml += "</urlset>";
  return xml;
}

function generateRobotsTxt(options: {
  baseUrl: string;
  disallowPaths: string[];
}): string {
  const { baseUrl, disallowPaths = [] } = options;
  let content = "User-agent: *\n";
  disallowPaths.forEach((path) => {
    content += `Disallow: ${path}\n`;
  });
  content += `\nSitemap: ${new URL("sitemap.xml", baseUrl).href}\n`;
  return content;
}

async function generateSitemapAndRobots(
  options: GenerateOptions
): Promise<void> {
  const {
    baseUrl = "http://localhost:3000",
    outDir = "public",
    maxDepth = 5,
    disallowPaths = [],
  } = options;

  console.log("Crawling site to generate sitemap...");
  const urlMap = await crawlSite(baseUrl, maxDepth);
  const sitemap = generateSitemap(urlMap);
  const robotsTxt = generateRobotsTxt({ baseUrl, disallowPaths });

  const sitemapPath = path.resolve(process.cwd(), outDir, "sitemap.xml");
  const robotsPath = path.resolve(process.cwd(), outDir, "robots.txt");

  fs.writeFileSync(sitemapPath, sitemap);
  fs.writeFileSync(robotsPath, robotsTxt);

  console.log(`Sitemap generated at ${sitemapPath}`);
  console.log(`robots.txt generated at ${robotsPath}`);
}

// Only run if this script is executed directly
if (require.main === module) {
  generateSitemapAndRobots({
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    outDir: process.env.OUT_DIR || "public",
    maxDepth: parseInt(process.env.MAX_DEPTH || "5", 10),
    disallowPaths: (process.env.DISALLOW_PATHS || "")
      .split(",")
      .filter(Boolean),
  });
}

export { generateSitemapAndRobots };
