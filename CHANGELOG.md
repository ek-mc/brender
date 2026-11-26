# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2026-11-26

### Changed
- Owner-approved tooling majors: @types/node 26.4.0 and checkout/setup-node 7.0.0 across workflows.
- TypeScript 6 to 7.0.2; retain public API and existing application runtime floor.

- Add compiled CLI, SDK error propagation and terminal polling regression tests (2 → 5 tests).

### Upgrade Notes
- Development tooling only; no intentional application API, data or runtime deployment changes.
- Actions v7 uses Node 24 on GitHub-hosted runners; application Node matrix unchanged.

## [1.0.5] - 2026-03-19

### Added
- Basic automated tests for `BrenderClient` request/response mapping in `test/client.test.cjs`.

### Changed
- Updated test script to run real Node tests (`node --test`) after build.
- CI/dependency updates merged from Dependabot PRs.

## [1.0.1] - 2026-03-12

### Changed
- Prepared release and publishing metadata for npm.
- Hardened `.gitignore` to exclude env files, npm auth config, logs, and editor artifacts.

### 🔗 Links
- **Repository**: https://github.com/ek-mc/brender (public)
- **NPM**: https://www.npmjs.com/package/brender

## [1.0.0] - 2026-03-11

### 🎉 Initial Release

First stable release of `brender` - A sleek wrapper for Cloudflare's Browser Rendering Crawl API.

### ✨ Features
- **CLI Tool**: `brender` command for crawling websites from terminal
  - `brender <url>` - Start a crawl job
  - `brender --status <job-id>` - Check job status  
  - `brender --wait` - Wait for completion
  - Support for `--format`, `--limit`, `--depth`, `--output` options
  - `--include` and `--exclude` path patterns
  - `--no-render` for static site crawling
- **Library API**: `BrenderClient` class for programmatic use
  - `crawl(options)` - Start a crawl job
  - `getJob(jobId)` - Get job status and results
  - `waitForCompletion(jobId)` - Poll until job completes
  - `crawlAndWait(options)` - Combined crawl + wait
- **TypeScript Support**: Full type definitions for all APIs
- **Authentication**: via `CF_ACCOUNT_ID` and `CF_API_TOKEN` environment variables
- **Output Formats**: HTML, Markdown, JSON
- **Configuration Options**:
  - Crawl depth control
  - Page limits
  - Include/exclude URL patterns
  - Modified since / max age filters
  - Render vs static mode

### 🔗 Links
- **Repository**: https://github.com/ek-mc/brender (public)
- **Releases**: https://github.com/ek-mc/brender/releases
- **NPM**: https://www.npmjs.com/package/brender

### 📦 Technical Details
- Zero runtime dependencies
- Node.js 18+ required
- Built with TypeScript
- MIT Licensed

---

## Usage Examples

### CLI
```bash
# Set credentials
export CF_ACCOUNT_ID="your-account-id"
export CF_API_TOKEN="your-api-token"

# Basic crawl
brender https://example.com

# With options
brender https://example.com --format markdown --limit 50 --wait

# Check status
brender --status <job-id>
```

### Library
```typescript
import { BrenderClient } from 'brender';

const client = new BrenderClient({
  accountId: process.env.CF_ACCOUNT_ID!,
  apiToken: process.env.CF_API_TOKEN!,
});

const result = await client.crawlAndWait({
  url: 'https://example.com',
  format: 'markdown',
});
```

## 2026-04-29

- Added basic GitHub Actions CI workflow (`.github/workflows/basic-ci.yml`).
- Maintenance: closed stale dependency PR queue for cleaner triage (where applicable).
