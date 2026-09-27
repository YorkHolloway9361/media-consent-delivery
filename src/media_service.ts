import { z } from "zod";
import { consentCheck } from "./consent_client.ts";

export const deliveryRequest = z.object({
  user_id: z.string().min(1),
  asset_id: z.string().min(1),
  category: z.string().min(1),
  creator_email: z.string().email()
});

export type DeliveryRequest = z.infer<typeof deliveryRequest>;

export async function planCreatorDelivery(input: unknown) {
  const request = deliveryRequest.parse(input);
  const granted = await consentCheck(request.user_id, request.category);
  if (!granted) return { status: "consent_required" as const, user_id: request.user_id, asset_id: request.asset_id };
  return {
    status: "queued" as const,
    asset_id: request.asset_id,
    creator_email: request.creator_email,
    job_key: `${request.user_id}:${request.asset_id}`
  };
}

if (import.meta.main) {
  const body = { user_id: "user_demo", asset_id: "asset_42", category: "media_delivery", creator_email: "creator@example.com" };
  console.log(await planCreatorDelivery(body));
}
