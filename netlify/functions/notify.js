import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { subscription, title, body, user_id, horarios } = JSON.parse(event.body);

    if (user_id && horarios) {
      await supabase.from("suscripciones").upsert({
        user_id,
        subscription,
        horarios,
      }, { onConflict: "user_id" });
    }

    if (title && body && subscription) {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
