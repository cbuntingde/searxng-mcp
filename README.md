# searxng-mcp

An MCP server for connecting agentic systems to search systems via [searXNG](https://docs.searxng.org/) - Node.js implementation.

## Tools

- `search` - Search the web using SearXNG metasearch engine. Aggregates results from multiple search engines (Google, Bing, DuckDuckGo, Brave, etc.). Supports advanced search syntax, category filtering, time ranges, and language preferences.
- `web_fetch` - Fetch and extract text content from a URL using intelligent HTML parsing.
- `web_crawl` - Crawl a website starting from a URL, recursively following links to extract content from multiple pages. Configurable depth, page limit, and domain restriction.

### web_crawl Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | *required* | Starting URL to crawl from |
| `max_depth` | number | 2 | Maximum link depth to follow (max: 5) |
| `max_pages` | number | 10 | Maximum number of pages to crawl (max: 50) |
| `same_domain` | boolean | true | Only crawl pages on the same domain |

## Usage

### via npx

```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "searxng-mcp"]
    }
  }
}
```

### via npm

```json
{
  "mcpServers": {
    "searxng": {
      "command": "node",
      "args": ["/path/to/searxng-mcp/dist/index.js"]
    }
  }
}
```

### Custom SearXNG URL

Set the environment variable `SEARXNG_URL` to your SearXNG instance (default: `http://localhost:8080`)

## Development

```bash
npm install
npm run build
npm start
```

---

Created by Chris Bunting
