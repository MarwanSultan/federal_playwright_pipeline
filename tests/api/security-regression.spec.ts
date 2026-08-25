import { expect, test } from '@playwright/test';

function requireApiConfiguration(...variables: string[]): Record<string, string> {
  const missing = variables.filter((variable) => !process.env[variable]);
  test.skip(
    !process.env.API_TESTS_READY || !process.env.BASE_URL || missing.length > 0,
    `Set API_TESTS_READY=true, BASE_URL, and ${missing.join(', ')} using an approved API contract.`,
  );

  return Object.fromEntries(
    variables.map((variable) => [variable, process.env[variable]!]),
  ) as Record<string, string>;
}

function expectedStatus(variable: string, fallback: number): number {
  return Number(process.env[variable] ?? fallback);
}

test.describe('security-critical API regression', () => {
  test('SEC-API-001: required security headers are present', async ({ request }) => {
    const { API_SECURITY_PATH } = requireApiConfiguration('API_SECURITY_PATH');
    const requiredHeaders = JSON.parse(process.env.API_REQUIRED_HEADERS ?? '{}') as Record<
      string,
      string
    >;
    expect(
      Object.keys(requiredHeaders).length,
      'API_REQUIRED_HEADERS must define approved header names and values',
    ).toBeGreaterThan(0);

    const response = await request.get(API_SECURITY_PATH!);
    expect(response.ok()).toBeTruthy();
    const headers = response.headers();
    for (const [name, expectedValue] of Object.entries(requiredHeaders)) {
      expect(headers[name.toLowerCase()]).toBe(expectedValue);
    }
  });

  test('SEC-AUTHN-001: protected resource rejects missing authentication', async ({ request }) => {
    const { API_PROTECTED_PATH } = requireApiConfiguration('API_PROTECTED_PATH');
    const response = await request.get(API_PROTECTED_PATH!);

    expect(response.status()).toBe(expectedStatus('API_PROTECTED_STATUS', 401));
  });

  test('SEC-AUTHZ-002: forbidden role cannot access a protected resource', async ({ request }) => {
    const { API_FORBIDDEN_PATH, API_FORBIDDEN_TOKEN } = requireApiConfiguration(
      'API_FORBIDDEN_PATH',
      'API_FORBIDDEN_TOKEN',
    );
    const response = await request.get(API_FORBIDDEN_PATH!, {
      headers: { authorization: `Bearer ${API_FORBIDDEN_TOKEN!}` },
    });

    expect(response.status()).toBe(expectedStatus('API_FORBIDDEN_STATUS', 403));
  });

  test('SEC-INPUT-001: malformed input is rejected without server error', async ({ request }) => {
    const { API_VALIDATION_PATH, API_VALIDATION_BODY } = requireApiConfiguration(
      'API_VALIDATION_PATH',
      'API_VALIDATION_BODY',
    );
    const response = await request.post(API_VALIDATION_PATH!, {
      data: JSON.parse(API_VALIDATION_BODY!),
      headers: { 'content-type': 'application/json' },
    });

    expect(response.status()).toBe(expectedStatus('API_VALIDATION_STATUS', 400));
    expect(response.status()).toBeLessThan(500);
  });

  test('SEC-API-002: unsupported method is rejected', async ({ request }) => {
    const { API_METHOD_PATH } = requireApiConfiguration('API_METHOD_PATH');
    const method = process.env.API_UNSUPPORTED_METHOD ?? 'TRACE';
    const response = await request.fetch(API_METHOD_PATH!, { method });

    expect(response.status()).toBe(expectedStatus('API_METHOD_STATUS', 405));
  });

  test('SEC-AUDIT-001: audit response contains the approved required fields', async ({
    request,
  }) => {
    const { API_AUDIT_PATH } = requireApiConfiguration('API_AUDIT_PATH');
    const requiredFields = (process.env.API_AUDIT_REQUIRED_FIELDS ?? '')
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean);
    expect(
      requiredFields,
      'API_AUDIT_REQUIRED_FIELDS must be supplied by the API contract',
    ).not.toEqual([]);

    const response = await request.get(API_AUDIT_PATH!);
    expect(response.ok()).toBeTruthy();
    const payload = (await response.json()) as Record<string, unknown>;
    for (const field of requiredFields) expect(payload).toHaveProperty(field);
  });
});
