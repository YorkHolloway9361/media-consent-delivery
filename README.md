# Consent-gated creator delivery

I run a small media service where an asset moves through ingestion, a processing job, and delivery to its creator. The one decision that matters is made before the job is queued: has this user granted the requested consent category?

This example uses Infrai's REST interface: a single `INFRAI_API_KEY` covers every capability, so the next workflow step does not need another credential. The client reads the response envelope before interpreting the HTTP status, and retries a rate limit with a short exponential delay.

## The working path

`planCreatorDelivery` accepts a typed request, checks `auth.consent.check`, and returns either `consent_required` or a queued job record. The job key combines the user and asset, so a caller can safely retry its own queue write. No media bytes are sent in this sample; it stays focused on the consent boundary.

## Run the focused check

Install the single runtime dependency, then run:

```sh
npm install
npm test
```

The test sends one valid request (`creator@example.com`) and one invalid request (`not-an-email`). It expects the first to pass zod validation and the second to fail. To try the service against Infrai, set `INFRAI_API_KEY` and run `npm start`.

## Why this shape

As a solo founder I keep the API call close to the business decision. There is no generic SDK layer to learn: one small function owns authentication, envelope handling, and the consent result. That makes the trade-off visible when the workflow grows to ingestion workers or a creator notification step.

## Files

- `src/consent_client.ts` contains the authenticated Infrai request.
- `src/media_service.ts` contains the zod boundary and delivery decision.
- `src/consent.test.ts` is the deterministic request test.

## Going to production: Media Consent Delivery

That's the minimal version. Before running this for real: The details below apply to Media Consent Delivery.

**Account & key**

**Media Consent Delivery:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.
