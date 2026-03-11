/**
 * Brender - Cloudflare Browser Rendering Crawl API Client
 */

export interface BrenderConfig {
  accountId: string;
  apiToken: string;
  baseUrl?: string;
}

export interface CrawlOptions {
  /** Starting URL to crawl */
  url: string;
  /** Output format: html, markdown, or json */
  format?: 'html' | 'markdown' | 'json';
  /** Maximum number of pages to crawl (default: 100) */
  limit?: number;
  /** Crawl depth (default: 3) */
  depth?: number;
  /** Use headless browser (default: true) */
  render?: boolean;
  /** URL patterns to include (wildcards supported) */
  includePaths?: string[];
  /** URL patterns to exclude (wildcards supported) */
  excludePaths?: string[];
  /** Only crawl pages modified since this date (ISO 8601) */
  modifiedSince?: string;
  /** Skip pages crawled within this many seconds */
  maxAge?: number;
}

export interface CrawlJob {
  id: string;
  url: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  pages?: CrawledPage[];
  errors?: string[];
}

export interface CrawledPage {
  url: string;
  title?: string;
  content: string;
  format: 'html' | 'markdown' | 'json';
  crawledAt: string;
  statusCode: number;
}

export class BrenderClient {
  private accountId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor(config: BrenderConfig) {
    this.accountId = config.accountId;
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl || 'https://api.cloudflare.com/client/v4';
  }

  /**
   * Start a new crawl job
   */
  async crawl(options: CrawlOptions): Promise<CrawlJob> {
    const url = `${this.baseUrl}/accounts/${this.accountId}/browser-rendering/crawl`;
    
    const body: Record<string, any> = {
      url: options.url,
    };

    if (options.format) body.format = options.format;
    if (options.limit) body.limit = options.limit;
    if (options.depth) body.depth = options.depth;
    if (options.render !== undefined) body.render = options.render;
    if (options.includePaths) body.include_paths = options.includePaths;
    if (options.excludePaths) body.exclude_paths = options.excludePaths;
    if (options.modifiedSince) body.modified_since = options.modifiedSince;
    if (options.maxAge) body.max_age = options.maxAge;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Crawl failed: ${response.status} ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Crawl failed: ${data.errors?.map((e: any) => e.message).join(', ')}`);
    }

    return {
      id: data.result.id,
      url: options.url,
      status: data.result.status,
      createdAt: data.result.created_at,
    };
  }

  /**
   * Get crawl job status and results
   */
  async getJob(jobId: string): Promise<CrawlJob> {
    const url = `${this.baseUrl}/accounts/${this.accountId}/browser-rendering/crawl/${jobId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get job: ${response.status} ${response.statusText} - ${error}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Failed to get job: ${data.errors?.map((e: any) => e.message).join(', ')}`);
    }

    const result = data.result;
    
    return {
      id: result.id,
      url: result.url,
      status: result.status,
      createdAt: result.created_at,
      pages: result.pages?.map((p: any) => ({
        url: p.url,
        title: p.title,
        content: p.content,
        format: p.format,
        crawledAt: p.crawled_at,
        statusCode: p.status_code,
      })),
      errors: result.errors,
    };
  }

  /**
   * Wait for a crawl job to complete
   */
  async waitForCompletion(jobId: string, pollIntervalMs: number = 5000, timeoutMs: number = 300000): Promise<CrawlJob> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const job = await this.getJob(jobId);
      
      if (job.status === 'completed' || job.status === 'failed') {
        return job;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    throw new Error(`Timeout waiting for job ${jobId} to complete`);
  }

  /**
   * Crawl and wait for completion in one call
   */
  async crawlAndWait(options: CrawlOptions, pollIntervalMs?: number, timeoutMs?: number): Promise<CrawlJob> {
    const job = await this.crawl(options);
    return this.waitForCompletion(job.id, pollIntervalMs, timeoutMs);
  }
}

// Export types
export * from './types';
