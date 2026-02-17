# searxng-mcp

An MCP server for connecting agentic systems to search systems via [searXNG](https://docs.searxng.org/) - Node.js implementation.

## Tools

- `search` - Search the web using SearXNG metasearch engine
- `web_fetch` - Fetch and extract content from a URL

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
