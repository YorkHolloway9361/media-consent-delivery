import assert from "node:assert/strict";
import { deliveryRequest } from "./media_service.ts";
import { consentCheck } from "./consent_client.ts";

const accepted = deliveryRequest.safeParse({ user_id: "u1", asset_id: "a1", category: "media_delivery", creator_email: "creator@example.com" });
assert.equal(accepted.success, true);
const rejected = deliveryRequest.safeParse({ user_id: "u1", asset_id: "a1", category: "media_delivery", creator_email: "not-an-email" });
assert.equal(rejected.success, false);
const previousKey = process.env.INFRAI_API_KEY;
const previousFetch = globalThis.fetch;
process.env.INFRAI_API_KEY = "test-key";
try {
  for (const result of [true, false]) {
    globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, data: { result } }), { status: 200 });
    assert.equal(await consentCheck("u1", "media_delivery"), result);
  }
} finally {
  globalThis.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.INFRAI_API_KEY;
  else process.env.INFRAI_API_KEY = previousKey;
}
console.log("consent request boundary: passed");
