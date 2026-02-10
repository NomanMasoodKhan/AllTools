export function sanitizeLogContext(context = {}) {
  const cloned = { ...context };

  if (cloned.password) {
    cloned.password = '[REDACTED]';
  }

  if (cloned.token) {
    cloned.token = '[REDACTED]';
  }

  return cloned;
}
