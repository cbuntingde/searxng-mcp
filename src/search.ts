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
