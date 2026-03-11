# brender - Cloudflare Browser Rendering Crawl API Wrapper

Simple wrapper for Cloudflare's Browser Rendering `/crawl` endpoint.

## Installation

```bash
npm install -g brender
# or
npx brender <url>
```

## Usage

### CLI

```bash
# Set your credentials
export CF_ACCOUNT_ID="your-account-id"
export CF_API_TOKEN="your-api-token"

# Crawl a website
brender https://example.com

# With options
brender https://example.com --format markdown --limit 10

# Check job status
brender --status <job-id>

# Save to file
brender https://example.com --output ./crawled-content.json
```

### Library

```typescript
import { BrenderClient } from 'brender';

const client = new BrenderClient({
  accountId: process.env.CF_ACCOUNT_ID,
  apiToken: process.env.CF_API_TOKEN,
});

// Start crawl
const job = await client.crawl({
  url: 'https://example.com',
  format: 'markdown',
  limit: 50,
});

console.log('Job ID:', job.id);

// Check status
const result = await client.getJob(job.id);
console.log('Pages:', result.pages);
```

## API Reference

### `crawl(options)`

Start a new crawl job.

**Options:**
- `url` (string) - Starting URL to crawl
- `format` (string) - Output format: `html`, `markdown`, `json` (default: `markdown`)
- `limit` (number) - Max pages to crawl (default: 100)
- `depth` (number) - Crawl depth (default: 3)
- `render` (boolean) - Use headless browser (default: true)
- `includePaths` (string[]) - URL patterns to include
- `excludePaths` (string[]) - URL patterns to exclude

### `getJob(jobId)`

Get crawl job status and results.

## Environment Variables

- `CF_ACCOUNT_ID` - Your Cloudflare account ID
- `CF_API_TOKEN` - Your Cloudflare API token with Browser Rendering permissions

## Links

- [Cloudflare Browser Rendering Docs](https://developers.cloudflare.com/browser-rendering/)
- [Crawl Endpoint Docs](https://developers.cloudflare.com/browser-rendering/rest-api/crawl-endpoint/)

## License

MIT
