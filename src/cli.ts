#!/usr/bin/env node

/**
 * Brender CLI
 * 
 * Usage:
 *   brender <url> [options]
 *   brender https://example.com
 *   brender https://example.com --format markdown --limit 10
 *   brender --status <job-id>
 */

import { BrenderClient } from './index';
import * as fs from 'fs';
import * as path from 'path';

function showHelp() {
  console.log(`
Brender - Cloudflare Browser Rendering Crawl CLI

Usage:
  brender <url> [options]     Crawl a website
  brender --status <job-id>   Check job status
  brender --help              Show this help

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

Environment Variables:
  CF_ACCOUNT_ID          Cloudflare account ID (required)
  CF_API_TOKEN           Cloudflare API token (required)

Examples:
  brender https://blog.cloudflare.com
  brender https://example.com --format json --limit 50 --output ./data.json
  brender https://example.com --wait
  brender --status abc-123-def
`);
}

function parseArgs(args: string[]) {
  const options: Record<string, any> = {
    render: true,
    wait: false,
    poll: 5000,
    timeout: 300000,
  };
  
  let url: string | null = null;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
    
    if (arg === '--status') {
      options.status = args[++i];
      continue;
    }
    
    if (arg === '--format') {
      options.format = args[++i];
      continue;
    }
    
    if (arg === '--limit') {
      options.limit = parseInt(args[++i], 10);
      continue;
    }
    
    if (arg === '--depth') {
      options.depth = parseInt(args[++i], 10);
      continue;
    }
    
    if (arg === '--no-render') {
      options.render = false;
      continue;
    }
    
    if (arg === '--include') {
      options.include = args[++i].split(',').map(s => s.trim());
      continue;
    }
    
    if (arg === '--exclude') {
      options.exclude = args[++i].split(',').map(s => s.trim());
      continue;
    }
    
    if (arg === '--output') {
      options.output = args[++i];
      continue;
    }
    
    if (arg === '--wait') {
      options.wait = true;
      continue;
    }
    
    if (arg === '--poll') {
      options.poll = parseInt(args[++i], 10);
      continue;
    }
    
    if (arg === '--timeout') {
      options.timeout = parseInt(args[++i], 10);
      continue;
    }
    
    // URL argument
    if (!arg.startsWith('--') && !url) {
      url = arg;
    }
  }
  
  return { url, options };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(1);
  }
  
  const { url, options } = parseArgs(args);
  
  // Get credentials from environment
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  
  if (!accountId || !apiToken) {
    console.error('Error: CF_ACCOUNT_ID and CF_API_TOKEN environment variables are required');
    console.error('\nSet them with:\n  export CF_ACCOUNT_ID="your-account-id"\n  export CF_API_TOKEN="your-api-token"');
    process.exit(1);
  }
  
  const client = new BrenderClient({ accountId, apiToken });
  
  // Check status mode
  if (options.status) {
    try {
      console.log(`Checking job ${options.status}...`);
      const job = await client.getJob(options.status);
      
      console.log(`\nJob ID: ${job.id}`);
      console.log(`URL: ${job.url}`);
      console.log(`Status: ${job.status}`);
      console.log(`Created: ${job.createdAt}`);
      
      if (job.pages) {
        console.log(`\nPages crawled: ${job.pages.length}`);
        job.pages.forEach((page, i) => {
          console.log(`  ${i + 1}. ${page.url} (${page.statusCode})`);
        });
      }
      
      if (job.errors && job.errors.length > 0) {
        console.log(`\nErrors: ${job.errors.length}`);
        job.errors.forEach(err => console.log(`  - ${err}`));
      }
      
      // Save if output specified
      if (options.output) {
        fs.writeFileSync(options.output, JSON.stringify(job, null, 2));
        console.log(`\nSaved to: ${options.output}`);
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
  
  // Crawl mode
  if (!url) {
    console.error('Error: URL is required');
    showHelp();
    process.exit(1);
  }
  
  try {
    console.log(`Starting crawl of ${url}...`);
    
    const crawlOptions = {
      url,
      format: options.format || 'markdown',
      limit: options.limit,
      depth: options.depth,
      render: options.render,
      includePaths: options.include,
      excludePaths: options.exclude,
    };
    
    let job;
    
    if (options.wait) {
      console.log('Waiting for completion...');
      job = await client.crawlAndWait(crawlOptions, options.poll, options.timeout);
      console.log(`\nCrawl ${job.status}!`);
    } else {
      job = await client.crawl(crawlOptions);
      console.log(`\nJob started!`);
      console.log(`Job ID: ${job.id}`);
      console.log(`\nCheck status with:`);
      console.log(`  brender --status ${job.id}`);
    }
    
    console.log(`\nStatus: ${job.status}`);
    
    if (job.pages) {
      console.log(`Pages crawled: ${job.pages.length}`);
      
      // Print first few pages
      job.pages.slice(0, 5).forEach((page, i) => {
        console.log(`\n--- Page ${i + 1}: ${page.url} ---`);
        const preview = page.content.substring(0, 500);
        console.log(preview + (page.content.length > 500 ? '...' : ''));
      });
      
      if (job.pages.length > 5) {
        console.log(`\n... and ${job.pages.length - 5} more pages`);
      }
    }
    
    // Save if output specified or if we waited
    if (options.output || options.wait) {
      const outputFile = options.output || `crawl-${job.id}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(job, null, 2));
      console.log(`\nSaved to: ${outputFile}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
