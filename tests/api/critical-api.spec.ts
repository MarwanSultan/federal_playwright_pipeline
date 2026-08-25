import { expect, test } from '@playwright/test';

function configuredPath(name: string): string | undefined {
  return process.env[name];
}

function requireApiConfiguration(pathVariable: string): string {
  const path = configuredPath(pathVariable);
  test.skip(
    !process.env.API_TESTS_READY || !process.env.BASE_URL || !path,
    `Set API_TESTS_READY=true, BASE_URL, and ${pathVariable} using an approved API contract.`,
  );
  return path!;
}

test.describe('critical API coverage', () => {
  test('API-001: health endpoint is available', async ({ request }) => {
    const response = await request.get(requireApiConfiguration('API_HEALTH_PATH'));

    expect(response.status()).toBeLessThan(400);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('API-002: authentication endpoint returns the approved success status', async ({
    request,
  }) => {
    const response = await request.get(requireApiConfiguration('API_AUTH_PATH'));
    const expectedStatus = Number(process.env.API_AUTH_STATUS ?? '200');

    expect(response.status()).toBe(expectedStatus);
  });

  test('API-003: primary resource returns its approved marker', async ({ request }) => {
    const response = await request.get(requireApiConfiguration('API_PRIMARY_PATH'));
    const marker = process.env.API_PRIMARY_MARKER;

    expect(marker, 'API_PRIMARY_MARKER must be supplied by the API contract').toBeTruthy();
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain(marker!);
  });

  test('API-004: critical transaction returns its confirmation marker', async ({ request }) => {
    const path = requireApiConfiguration('API_SUBMISSION_PATH');
    const marker = process.env.API_SUBMISSION_MARKER;
    const body = process.env.API_SUBMISSION_BODY;

    expect(marker, 'API_SUBMISSION_MARKER must be supplied by the API contract').toBeTruthy();
    expect(body, 'API_SUBMISSION_BODY must be supplied by the API contract').toBeTruthy();

    const response = await request.post(path, {
      data: JSON.parse(body!),
      headers: { 'content-type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain(marker!);
  });

  test('API-005: unauthorized resource access is rejected', async ({ request }) => {
    const response = await request.get(requireApiConfiguration('API_UNAUTHORIZED_PATH'));
    const expectedStatus = Number(process.env.API_UNAUTHORIZED_STATUS ?? '403');

    expect([401, 403]).toContain(expectedStatus);
    expect(response.status()).toBe(expectedStatus);
  });

  test('API-006: audit endpoint exposes its approved event marker', async ({ request }) => {
    const response = await request.get(requireApiConfiguration('API_AUDIT_PATH'));
    const marker = process.env.API_AUDIT_MARKER;

    expect(marker, 'API_AUDIT_MARKER must be supplied by the API contract').toBeTruthy();
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain(marker!);
  });

  test('API-007: routed API response is intercepted and validated', async ({ page }) => {
    const routeUrl = 'https://playwright.invalid/api/routed-response';
    const routedPayload = { status: 'approved', source: 'playwright-route' };

    await page.route(routeUrl, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(routedPayload),
      });
    });

    const response = await page.evaluate(async (url) => {
      const result = await fetch(url);
      return { status: result.status, body: await result.json() };
    }, routeUrl);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(routedPayload);
  });
});
