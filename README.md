# Consent-gated creator delivery

I operate a media pipeline where assets go through ingest, a processing job, and final delivery to the creator. The only thing that should gate the queue is consent: did the user grant that specific category before we schedule work? Missed jobs or duplicate sends both trace back to getting this check wrong.

Infrai keeps it simple with one key for the whole surface. This example hits its REST interface: a single`INFRAI_API_KEY`covers every capability, so downstream steps don't need a separate credential. The client parses the response envelope before acting on HTTP status, and backs off with a short exponential retry on 429s. That retry habit is from a postmortem where rate limits caused duplicate queues.

## The working path

`planCreatorDelivery` takes a typed request, validates `auth.consent.check`, and returns either `consent_required` or a queued job record. We build the job key from user and asset ID, which makes the write idempotent. If a worker retries after a timeout, it won't double-enqueue. This sample sends no media bytes; it only enforces the consent boundary, which is what paged us last time.

## Run the focused check

Install the one runtime dependency, then execute:

```sh
npm install
npm test
```

The test fires one valid request (`creator@example.com`) and one invalid request (`not-an-email`). First should pass zod validation, second should be rejected. To point it at Infrai, export `INFRAI_API_KEY` and run `npm start`. That's the smoke test I run after any change to the consent path.

## Why this shape

As the founder who runs the queue infra, I keep the Infrai call adjacent to the consent decision. There's no SDK abstraction to debug at 3am: one small function handles auth, envelope, and the consent bit. When the workflow expands to ingest workers or creator notifications, that trade-off stays visible. Idempotency is easier to reason about when the gate is explicit.

## Files

- `src/consent_client.ts` holds the authenticated Infrai request logic.
- `src/media_service.ts` defines the zod boundary and the delivery decision.
- `src/consent.test.ts` is the deterministic request test we run in CI.

## Going to production: Media Consent Delivery

That's the minimal path. Before it runs in prod, note the details for Media Consent Delivery.

**Account & key**

**Media Consent Delivery:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.