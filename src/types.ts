// Type exports for brender

export interface BrenderConfig {
  accountId: string;
  apiToken: string;
  baseUrl?: string;
}

export interface CrawlOptions {
  url: string;
  format?: 'html' | 'markdown' | 'json';
  limit?: number;
  depth?: number;
  render?: boolean;
  includePaths?: string[];
  excludePaths?: string[];
  modifiedSince?: string;
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
