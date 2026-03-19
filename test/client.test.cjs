const test = require('node:test');
const assert = require('node:assert/strict');
const { BrenderClient } = require('../dist/index.js');

test('crawl sends mapped payload and returns normalized job', async () => {
  const originalFetch = global.fetch;

  let captured = null;
  global.fetch = async (url, init) => {
    captured = { url, init };
    return {
      ok: true,
      json: async () => ({
        success: true,
        result: {
          id: 'job-123',
          status: 'pending',
          created_at: '2026-03-19T12:00:00Z',
        },
      }),
    };
  };

  try {
    const client = new BrenderClient({
      accountId: 'acc_1',
      apiToken: 'tok_1',
      baseUrl: 'https://api.example.com',
    });

    const job = await client.crawl({
      url: 'https://example.com',
      format: 'markdown',
      limit: 10,
      depth: 2,
      render: false,
      includePaths: ['/docs/*'],
      excludePaths: ['/private/*'],
      modifiedSince: '2026-03-01T00:00:00Z',
      maxAge: 3600,
    });

    assert.equal(captured.url, 'https://api.example.com/accounts/acc_1/browser-rendering/crawl');
    assert.equal(captured.init.method, 'POST');
    assert.equal(captured.init.headers.Authorization, 'Bearer tok_1');

    const sentBody = JSON.parse(captured.init.body);
    assert.deepEqual(sentBody, {
      url: 'https://example.com',
      format: 'markdown',
      limit: 10,
      depth: 2,
      render: false,
      include_paths: ['/docs/*'],
      exclude_paths: ['/private/*'],
      modified_since: '2026-03-01T00:00:00Z',
      max_age: 3600,
    });

    assert.deepEqual(job, {
      id: 'job-123',
      url: 'https://example.com',
      status: 'pending',
      createdAt: '2026-03-19T12:00:00Z',
    });
  } finally {
    global.fetch = originalFetch;
  }
});

test('getJob maps API result into normalized job pages', async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      success: true,
      result: {
        id: 'job-ok',
        url: 'https://example.com',
        status: 'completed',
        created_at: '2026-03-19T12:00:00Z',
        pages: [
          {
            url: 'https://example.com/a',
            title: 'A',
            content: '# A',
            format: 'markdown',
            crawled_at: '2026-03-19T12:05:00Z',
            status_code: 200,
          },
        ],
        errors: [],
      },
    }),
  });

  try {
    const client = new BrenderClient({ accountId: 'acc', apiToken: 'tok', baseUrl: 'https://api.example.com' });
    const job = await client.getJob('job-ok');

    assert.equal(job.id, 'job-ok');
    assert.equal(job.status, 'completed');
    assert.equal(job.pages.length, 1);
    assert.deepEqual(job.pages[0], {
      url: 'https://example.com/a',
      title: 'A',
      content: '# A',
      format: 'markdown',
      crawledAt: '2026-03-19T12:05:00Z',
      statusCode: 200,
    });
  } finally {
    global.fetch = originalFetch;
  }
});
