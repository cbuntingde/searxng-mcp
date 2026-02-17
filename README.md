# @gsxrchris/searxng-mcp

[![npm](https://img.shields.io/npm/v/@gsxrchris/searxng-mcp)](https://www.npmjs.com/package/@gsxrchris/searxng-mcp)

An MCP server for connecting AI assistants to [SearXNG](https://docs.searxng.org/) metasearch engine.

## Tools

- `search` - Search the web using SearXNG. Aggregates results from multiple search engines with support for advanced search syntax, category filtering, time ranges, and language preferences.
- `web_fetch` - Fetch and extract content from a URL using intelligent HTML parsing.
- `web_crawl` - Crawl a website recursively to extract content from multiple pages.

### web_crawl Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | *required* | Starting URL to crawl |
| `max_depth` | number | 2 | Maximum link depth (max: 5) |
| `max_pages` | number | 10 | Maximum pages to crawl (max: 50) |
| `same_domain` | boolean | true | Only crawl same domain |

## Quick Start

```bash
npx -y @gsxrchris/searxng-mcp
```

Or install globally:

```bash
npm install -g @gsxrchris/searxng-mcp
```

## Configuration

Set `SEARXNG_URL` environment variable to your SearXNG instance (default: `http://localhost:8080`).

### Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "@gsxrchris/searxng-mcp"]
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "@gsxrchris/searxng-mcp"]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "servers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "@gsxrchris/searxng-mcp"]
    }
  }
}
```

### OpenCode

Add to `opencode.json`:

```json
{
  "mcp": {
    "searxng": {
      "type": "local",
      "command": ["npx", "-y", "@gsxrchris/searxng-mcp"],
      "enabled": true
    }
  }
}
```

## Development

```bash
npm install
npm run build
npm start
```

---

Created by Chris Bunting
