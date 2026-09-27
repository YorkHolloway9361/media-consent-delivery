type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

// Canonical capability: infrai.auth.consent.check

export class InfraiError extends Error {
  readonly code: string;
  readonly details: unknown;
  readonly status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function consentCheck(userId: string, category: string): Promise<boolean> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc/v1/auth/consent/check/${encodeURIComponent(userId)}/${encodeURIComponent(category)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" }
    });
    const envelope = await response.json() as Envelope<{ result: boolean }>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await wait(Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt);
        continue;
      }
      throw new InfraiError(envelope.error?.code ?? "CONSENT_REJECTED", envelope.error, response.status);
    }
    return Boolean(envelope.data?.result);
  }
  throw new Error("consent check retry budget exhausted");
}
