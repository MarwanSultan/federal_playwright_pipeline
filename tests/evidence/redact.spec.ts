import { expect, test } from '@playwright/test';
import { redact } from '../../src/evidence/redact.js';

test.describe('evidence redaction', () => {
  test('removes secrets from nested evidence payloads', () => {
    const safe = redact({
      authorization: 'Bearer do-not-retain',
      username: 'synthetic-user',
      nested: { password: 'do-not-retain', result: 'denied' },
      message: 'Bearer another-secret',
    });

    expect(safe).toEqual({
      authorization: '[REDACTED]',
      username: 'synthetic-user',
      nested: { password: '[REDACTED]', result: 'denied' },
      message: 'Bearer [REDACTED]',
    });
    expect(JSON.stringify(safe)).not.toContain('do-not-retain');
  });
});
