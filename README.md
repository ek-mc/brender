# brender 🕷️

[![npm version](https://img.shields.io/npm/v/brender.svg)](https://www.npmjs.com/package/brender)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![CI](https://github.com/ek-mc/brender/actions/workflows/ci.yml/badge.svg)](https://github.com/ek-mc/brender/actions/workflows/ci.yml)

> **B**rowser **Render**ing - A sleek wrapper for Cloudflare's Browser Rendering Crawl API

Crawl entire websites with a single command. Convert any site to Markdown, HTML, or structured JSON for RAG pipelines, AI training, or content migration.

---

## ✨ Features

- 🚀 **Simple CLI** - One command to crawl any site
- 📦 **Zero Dependencies** - Lightweight and fast
- 📝 **Multiple Formats** - HTML, Markdown, or JSON output
- 🔍 **Smart Discovery** - Automatic URL discovery from sitemaps & links
- ⏱️ **Async Jobs** - Start crawl, check back later
- 🎯 **Path Filtering** - Include/exclude specific URL patterns
- 🔒 **Type-Safe** - Full TypeScript support

---

## 📦 Installation

```bash
# Install globally
npm install -g brender

# Or use without installing
npx brender <url>
```

---

## 🚀 Quick Start

```bash
# Set your Cloudflare credentials
export CF_ACCOUNT_ID="your-account-id"
export CF_API_TOKEN="your-api-token"

# Crawl a website
brender https://blog.cloudflare.com

# Crawl and wait for completion
brender https://example.com --wait

# Get markdown output, limit to 50 pages
brender https://example.com --format markdown --limit 50 --output ./content.json
```

---

## 📚 Usage

### CLI Options

```
Usage: brender <url> [options]

Options:
  --format <format>      Output format: html, markdown, json (default: markdown)
  --limit <number>       Max pages to crawl (default: 100)
  --depth <number>       Crawl depth (default: 3)
  --no-render            Don't use headless browser (faster for static sites)
  --include <patterns>   Comma-separated URL patterns to include
  --exclude <patterns>   Comma-separated URL patterns to exclude
  --output <file>        Save results to file
  --wait                 Wait for job completion
  --poll <ms>            Poll interval in ms (default: 5000)
  --timeout <ms>         Timeout in ms (default: 300000)
  --status <job-id>      Check existing job status
  --help                 Show help
```

### Examples

```bash
# Basic crawl
brender https://example.com

# Crawl specific paths only
brender https://docs.example.com --include "/api/*,/guides/*"

# Skip certain paths
brender https://example.com --exclude "/admin/*,/private/*"

# Fast static crawl (no browser rendering)
brender https://example.com --no-render --format json

# Check job status later
brender --status abc-123-def
```

---

## 🛠️ Library Usage

```typescript
import { BrenderClient } from 'brender';

const client = new BrenderClient({
  accountId: process.env.CF_ACCOUNT_ID!,
  apiToken: process.env.CF_API_TOKEN!,
});

// Start a crawl job
const job = await client.crawl({
  url: 'https://example.com',
  format: 'markdown',
  limit: 100,
});

console.log('Job started:', job.id);

// Wait for completion
const result = await client.waitForCompletion(job.id);
console.log(`Crawled ${result.pages?.length} pages`);

// Process results
for (const page of result.pages || []) {
  console.log(`${page.url}: ${page.content.substring(0, 100)}...`);
}
```

---

## 🔑 Getting Credentials

1. **Account ID**: Find in [Cloudflare Dashboard](https://dash.cloudflare.com/) sidebar
2. **API Token**: Create at [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Use the "Browser Rendering" template
   - Or manually grant: `Account > Browser Rendering > Edit`

---

## 📖 API Reference

### `crawl(options)`

Start a new crawl job.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | required | Starting URL |
| `format` | `'html' \| 'markdown' \| 'json'` | `'markdown'` | Output format |
| `limit` | `number` | `100` | Max pages to crawl |
| `depth` | `number` | `3` | Crawl depth |
| `render` | `boolean` | `true` | Use headless browser |
| `includePaths` | `string[]` | - | URL patterns to include |
| `excludePaths` | `string[]` | - | URL patterns to exclude |
| `modifiedSince` | `string` | - | ISO date for incremental crawl |
| `maxAge` | `number` | - | Skip recently crawled pages |

### `getJob(jobId)`

Get crawl job status and results.

### `waitForCompletion(jobId, pollInterval?, timeout?)`

Poll until job completes.

### `crawlAndWait(options, pollInterval?, timeout?)`

Start crawl and wait for completion.

---

## 🧪 Development & CI

This repository uses GitHub Actions for continuous integration.

- Workflow: `.github/workflows/ci.yml`
- Triggers: pushes to `main` and pull requests
- Checks: `npm ci`, `npm run build`, `npm test`

You can view all runs here: https://github.com/ek-mc/brender/actions/workflows/ci.yml

---

## 🔗 Links

- [📦 NPM Package Page](https://www.npmjs.com/package/brender)
- [👤 NPM Publisher](https://www.npmjs.com/~ek-mc)
- [🐙 GitHub Repository](https://github.com/ek-mc/brender)
- [📘 Cloudflare Browser Rendering Docs](https://developers.cloudflare.com/browser-rendering/)
- [📗 Crawl Endpoint Docs](https://developers.cloudflare.com/browser-rendering/rest-api/crawl-endpoint/)
- [🐛 Report Issues](https://github.com/ek-mc/brender/issues)

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## 📄 License

See [LICENSE](LICENSE).

License: MIT

---

<p align="center">
  Made with ❤️ for the Cloudflare community
</p>
