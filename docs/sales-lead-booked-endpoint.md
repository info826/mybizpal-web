# `POST /api/sales-lead/booked` — contract for the API pane

**Status: the WEB side is live and calling this endpoint. The endpoint does not
exist yet.** Until it ships, every call 404s. That is survivable by design — the
call is best-effort and nothing user-facing depends on it — but the lead flag and
the callback suppression do not happen until the API pane builds this.

Raised by the web pane, 19 August 2026. Commissioned to the API pane.

## What the browser sends

On Calendly's `calendly.event_scheduled` (origin-checked against
`https://calendly.com`), the Contact Sales success step fires once per booking:

```
POST {API_URL}/api/sales-lead/booked
Content-Type: application/json

{
  "business_email": "someone@company.com",
  "booked": true,
  "event_uri": "https://api.calendly.com/scheduled_events/EVT123"
}
```

- `event_uri` is Calendly's canonical event URI, taken from
  `payload.event.uri`. **It is the idempotency key**, and it is the same key the
  Calendly webhook will carry later — so a client signal and a webhook for one
  booking must reconcile to ONE row, not two.
- `event_uri` can be `null` if Calendly ever omits it. Treat a null as
  non-idempotent and fall back to `business_email` + a time window, or reject —
  the web side will not retry either way.
- Sent with `keepalive: true`, because the user often closes the modal or the tab
  within a second of booking.
- The browser sends this **at most once per booking**; a repeated
  `event_scheduled` for the same `event_uri` is suppressed client-side. Do not
  rely on that alone — see idempotency below.

## What it should do

1. Mark the matching `sales_leads` row `meeting_booked`.
2. Suppress the outbound callback campaign for that lead's number.
3. Record `event_uri` so the later Calendly webhook is recognised as the same
   booking rather than a second one.

The suggested reuse (per the ruling) is the existing notifications idempotency
ledger, keyed on `event_uri`.

## Things worth deciding before building

- **Matching.** `business_email` is the only identifier the browser has —
  `/api/sales-lead` inserts with `Prefer: return=minimal` and returns no row id,
  which is also why `utm_content` carries the email rather than a lead id. A
  repeat enquirer has more than one row with that email; the newest is probably
  the right one, but that is a product decision, not an obvious default.
- **HARD RULE 10.** `meeting_booked` is a persisted field. If `sales_leads` has
  no such column, the DDL ships WITH the batch as an explicit promotion step,
  and the write path must not ship ahead of the column — a fail-soft write would
  hide the whole feature exactly as rule 10 describes.
- **Unauthenticated and public.** This endpoint takes an email and marks a lead
  from an unauthenticated browser call. Anyone can POST to it. Worst case today
  is someone suppressing callbacks for an email they guess. Rate-limiting, or
  requiring the `event_uri` to be verifiable against Calendly's API, is worth a
  ruling before this is load-bearing.
- **Authority.** The Calendly webhook (Standard plan) is intended to be the
  authoritative signal. This client call is the fast one. When the webhook
  lands, decide explicitly which wins on conflict — the webhook should, and the
  ledger keyed on `event_uri` is what makes that safe.

## What the web side already guarantees

- Fires only after Calendly confirms the booking, never on intent.
- Origin-checked: a same-origin forgery cannot trigger it (asserted in
  `scripts/success-step.mjs`).
- Exactly one POST per booking, body asserted, at three viewports.
- Total failure of this endpoint changes nothing the user sees.
