import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";

const SEARXNG_URL = process.env.SEARXNG_URL || "http://localhost:8080";

export interface SearchResult {
  url: string;
  title: string;
  content: string;
  engine?: string;
  score?: number;
  category?: string;
}

export interface InfoboxData {
  infobox: string;
  id: string;
  content: string;
  urls?: { title: string; url: string }[];
}

export interface SearchResponse {
  query: string;
  number_of_results: number;
  results: SearchResult[];
  infoboxes: InfoboxData[];
  answers?: string[];
  corrections?: string[];
  suggestions?: string[];
}

export interface SearchParams {
  query: string;
  limit?: number;
  category?: string;
  engines?: string;
  language?: string;
  time_range?: string;
  safesearch?: number;
  pageno?: number;
}

export async function search(params: SearchParams): Promise<string> {
  const {
    query,
    limit = 10,
    category,
    engines,
    language,
    time_range,
    safesearch,
    pageno = 1,
  } = params;

  const searchParams: Record<string, string | number> = {
    q: query,
    format: "json",
    pageno,
  };

  if (category) searchParams.categories = category;
  if (engines) searchParams.engines = engines;
  if (language) searchParams.language = language;
  if (time_range) searchParams.time_range = time_range;
  if (safesearch !== undefined) searchParams.safesearch = safesearch;

  try {
    const response = await axios.get<SearchResponse>(
      `${SEARXNG_URL}/search`,
      { params: searchParams }
    );

    const data = response.data;
    let text = "";

    text += `Query: ${data.query}\n`;
    text += `Number of results: ${data.number_of_results}\n\n`;

    if (data.infoboxes && data.infoboxes.length > 0) {
      for (const infobox of data.infoboxes) {
        text += `=== Infobox: ${infobox.infobox} ===\n`;
        text += `ID: ${infobox.id}\n`;
        text += `Content: ${infobox.content}\n`;
        if (infobox.urls && infobox.urls.length > 0) {
          text += `Related URLs:\n`;
          for (const url of infobox.urls) {
            text += `  - ${url.title}: ${url.url}\n`;
          }
        }
        text += "\n";
      }
    }

    if (data.answers && data.answers.length > 0) {
      text += `=== Answers ===\n`;
      for (const answer of data.answers) {
        text += `${answer}\n`;
      }
      text += "\n";
    }

    if (data.corrections && data.corrections.length > 0) {
      text += `=== Corrections ===\n`;
      for (const correction of data.corrections) {
        text += `- ${correction}\n`;
      }
      text += "\n";
    }

    if (data.suggestions && data.suggestions.length > 0) {
      text += `=== Suggestions ===\n`;
      for (const suggestion of data.suggestions) {
        text += `- ${suggestion}\n`;
      }
      text += "\n";
    }

    if (!data.results || data.results.length === 0) {
      text += "No results found\n";
    } else {
      text += `=== Results ===\n`;
      for (let i = 0; i < Math.min(data.results.length, limit); i++) {
        const result = data.results[i];
        text += `[${i + 1}] ${result.title}\n`;
        text += `    URL: ${result.url}\n`;
        text += `    Content: ${result.content.substring(0, 500)}${result.content.length > 500 ? "..." : ""}\n`;
        if (result.engine) {
          text += `    Engine: ${result.engine}\n`;
        }
        if (result.score !== undefined) {
          text += `    Score: ${result.score}\n`;
        }
        text += "\n";
      }
    }

    return text;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.code === "ECONNREFUSED") {
        throw new Error(`Cannot connect to SearXNG at ${SEARXNG_URL}. Is the server running?`);
      }
      throw new Error(`Search failed: ${error.message}`);
    }
    throw error;
  }
}

export interface CrawlParams {
  url: string;
  max_depth?: number;
  max_pages?: number;
  same_domain?: boolean;
}

export interface CrawlResult {
  pages_crawled: number;
  pages: { url: string; title: string; content: string; depth: number; links: string[] }[];
}

export async function crawlUrl(params: CrawlParams): Promise<string> {
  const {
    url: startUrl,
    max_depth = 2,
    max_pages = 10,
    same_domain = true,
  } = params;

  const visited = new Set<string>();
  const results: CrawlResult["pages"] = [];
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];

  let startHostname: string;
  try {
    startHostname = new URL(startUrl).hostname;
  } catch {
    throw new Error(`Invalid start URL: ${startUrl}`);
  }

  while (queue.length > 0 && results.length < max_pages) {
    const item = queue.shift();
    if (!item) break;

    const { url: currentUrl, depth } = item;

    let normalizedUrl: string;
    try {
      const parsed = new URL(currentUrl);
      parsed.hash = "";
      normalizedUrl = parsed.toString();
    } catch {
      continue;
    }

    if (visited.has(normalizedUrl)) continue;
    visited.add(normalizedUrl);

    if (same_domain) {
      try {
        if (new URL(normalizedUrl).hostname !== startHostname) continue;
      } catch {
        continue;
      }
    }

    try {
      const response = await axios.get<string>(normalizedUrl, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MCP-SearXNG/0.2.0)",
        },
        maxRedirects: 3,
      });

      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
        continue;
      }

      const $ = cheerio.load(response.data);
      $("script, style, nav, header, footer, aside, noscript").remove();

      const title = $("title").text().trim() || $("h1").first().text().trim() || "";

      const mainContent = $("main, article, .content, .post, .entry").first();
      const rawContent = mainContent.length > 0 ? mainContent.text() : $("body").text();

      const cleaned = rawContent
        .replace(/\s+/g, " ")
        .replace(/[\n\r]+/g, "\n")
        .trim()
        .split("\n")
        .filter((line: string) => line.trim().length > 0)
        .join("\n")
        .substring(0, 5000);

      const links: string[] = [];
      if (depth < max_depth) {
        $("a[href]").each((_: number, el: any) => {
          try {
            const href = $(el).attr("href");
            if (!href) return;
            const resolved = new URL(href, normalizedUrl).toString();
            const resolvedParsed = new URL(resolved);
            if (resolvedParsed.protocol === "http:" || resolvedParsed.protocol === "https:") {
              resolvedParsed.hash = "";
              const resolvedClean = resolvedParsed.toString();
              if (!visited.has(resolvedClean)) {
                links.push(resolvedClean);
              }
            }
          } catch {
            // skip invalid URLs
          }
        });
      }

      results.push({ url: normalizedUrl, title, content: cleaned, depth, links });

      if (depth < max_depth) {
        for (const link of links) {
          if (!visited.has(link) && results.length + queue.length < max_pages * 2) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }
    } catch {
      // skip pages that fail to load
    }
  }

  let text = `=== Web Crawl Results ===\n`;
  text += `Start URL: ${startUrl}\n`;
  text += `Pages crawled: ${results.length}\n`;
  text += `Max depth: ${max_depth}\n\n`;

  for (let i = 0; i < results.length; i++) {
    const page = results[i];
    text += `--- Page ${i + 1} (depth: ${page.depth}) ---\n`;
    text += `URL: ${page.url}\n`;
    if (page.title) text += `Title: ${page.title}\n`;
    text += `Content:\n${page.content}\n`;
    if (page.links.length > 0) {
      text += `Links found: ${page.links.length}\n`;
    }
    text += "\n";
  }

  return text;
}

export async function fetchUrl(url: string): Promise<string> {
  try {
    const response = await axios.get<string>(url, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MCP-SearXNG/0.2.0)",
      },
    });

    const $ = cheerio.load(response.data);
    
    $("script, style, nav, header, footer, aside, noscript").remove();
    
    let text = "";
    
    const title = $("title").text() || $("h1").first().text();
    if (title) {
      text += `Title: ${title.trim()}\n\n`;
    }
    
    const mainContent = $("main, article, .content, .post, .entry").first();
    const content = mainContent.length > 0 ? mainContent.text() : $("body").text();
    
    const cleaned = content
      .replace(/\s+/g, " ")
      .replace(/[\n\r]+/g, "\n")
      .trim()
      .split("\n")
      .filter(line => line.trim().length > 0)
      .join("\n");
    
    return text + cleaned.substring(0, 10000);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
    throw error;
  }
}
