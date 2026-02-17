# @gsxrchris/searxng-mcp

[![npm](https://img.shields.io/npm/v/@gsxrchris/searxng-mcp)](https://www.npmjs.com/package/@gsxrchris/searxng-mcp)

An MCP server for connecting agentic systems to search systems via [searXNG](https://docs.searxng.org/) - Node.js implementation.

## Installation

```bash
npm install @gsxrchris/searxng-mcp
```

Or via npx (no installation required):

```bash
npx -y @gsxrchris/searxng-mcp
```

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
      "args": ["-y", "@gsxrchris/searxng-mcp"]
    }
  }
}
```

### via npm (global install)

```bash
npm install -g @gsxrchris/searxng-mcp
```

```json
{
  "mcpServers": {
    "searxng": {
      "command": "searxng-mcp"
    }
  }
}
```

### via npm (local install)

After installing locally in your project:
```bash
npm install @gsxrchris/searxng-mcp
```

The command path depends on your setup. You may need to use the full path or add node_modules/.bin to your PATH.

### Custom SearXNG URL

Set the environment variable `SEARXNG_URL` to your SearXNG instance (default: `http://localhost:8080`)

## OpenCode Configuration

Add this to your `opencode.json`:

```json
{
  "mcp": {
    "searxng": {
      "type": "local",
      "command": ["npx", "-y", "@gsxrchris/searxng-mcp"],
      "environment": {
        "SEARXNG_URL": "http://localhost:8888"
      },
      "enabled": true
    }
  }
}
```

## Editor Configuration

### Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "@gsxrchris/searxng-mcp"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888"
      }
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "@gsxrchris/searxng-mcp"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888"
      }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json` or workspace `.cursor/mcp.json`:

```json
{
  "servers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "@gsxrchris/searxng-mcp"],
      "env": {
        "SEARXNG_URL": "http://localhost:8888"
      }
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