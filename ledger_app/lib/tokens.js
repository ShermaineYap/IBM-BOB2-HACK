import crypto from 'node:crypto';

export function resetToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function requestId() {
  return crypto.randomUUID();
}

export function validSignature(payload, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature ?? ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
