import { search, fetchUrl, crawlUrl, SearchParams, CrawlParams } from "./search.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

interface TextContent {
  type: "text";
  text: string;
}

export function listTools(): { tools: Tool[] } {
  const tools: Tool[] = [
    {
      name: "search",
      description: `Search the web using SearXNG metasearch engine. Aggregates results from multiple search engines 
(Google, Bing, DuckDuckGo, Brave, etc.). Supports advanced search syntax like "site:github.com", 
"time range" filters, category filtering, and language preferences.`,
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query. Supports search engine syntax (e.g., site:github.com SearXNG)",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default: 10)",
            default: 10,
          },
          category: {
            type: "string",
            description: "Search category: general, images, videos, news, science, files, music, social (optional)",
          },
          engines: {
            type: "string",
            description: "Comma-separated list of specific engines to use (optional)",
          },
          language: {
            type: "string",
            description: "Language code (e.g., en, fr, de, auto)",
          },
          time_range: {
            type: "string",
            description: "Time range: day, month, year (for engines that support it)",
            enum: ["day", "month", "year"],
          },
          safesearch: {
            type: "number",
            description: "Safe search level: 0 (none), 1 (moderate), 2 (strict)",
            enum: [0, 1, 2],
          },
          pageno: {
            type: "number",
            description: "Page number for pagination (default: 1)",
            default: 1,
          },
        },
        required: ["query"],
      },
    },
    {
      name: "web_fetch",
      description: `Fetch and extract text content from a URL. Downloads the page and extracts the main content 
using intelligent parsing. Useful for getting detailed information from specific URLs found in search results.`,
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to fetch and extract content from",
          },
        },
        required: ["url"],
      },
    },
    {
      name: "web_crawl",
      description: `Crawl a website starting from a URL, recursively following links to extract content from multiple pages. 
Useful for gathering comprehensive information from a website, documentation sites, or exploring site structure.`,
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The starting URL to crawl from",
          },
          max_depth: {
            type: "number",
            description: "Maximum link depth to follow (default: 2, max: 5)",
            default: 2,
          },
          max_pages: {
            type: "number",
            description: "Maximum number of pages to crawl (default: 10, max: 50)",
            default: 10,
          },
          same_domain: {
            type: "boolean",
            description: "Only crawl pages on the same domain as the start URL (default: true)",
            default: true,
          },
        },
        required: ["url"],
      },
    },
  ];

  return { tools };
}

export async function searchTool(
  args: SearchParams | { url: string } | CrawlParams
): Promise<{ content: TextContent[]; isError?: boolean }> {
  try {
    if ("max_depth" in args || ("url" in args && "same_domain" in args)) {
      const crawlArgs = args as CrawlParams;
      const clampedDepth = Math.min(crawlArgs.max_depth ?? 2, 5);
      const clampedPages = Math.min(crawlArgs.max_pages ?? 10, 50);
      const result = await crawlUrl({
        ...crawlArgs,
        max_depth: clampedDepth,
        max_pages: clampedPages,
      });
      return { content: [{ type: "text", text: result }] };
    }

    if ("url" in args) {
      const result = await fetchUrl(args.url);
      return { content: [{ type: "text", text: result }] };
    }
    
    const result = await search(args);
    return { content: [{ type: "text", text: result }] };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
