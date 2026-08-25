const SENSITIVE_KEY =
  /(password|passphrase|secret|token|authorization|cookie|api[-_]?key|private[-_]?key|ssn|email)/i;
const REDACTED = '[REDACTED]';

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        SENSITIVE_KEY.test(key) ? REDACTED : redact(child),
      ]),
    );
  }
  if (typeof value === 'string') {
    return value
      .replace(/Bearer\s+\S+/gi, `Bearer ${REDACTED}`)
      .replace(/(?:password|token|api[_-]?key)=([^&\s]+)/gi, `$1=${REDACTED}`);
  }
  return value;
}
