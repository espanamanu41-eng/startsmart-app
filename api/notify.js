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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { subscription, title, body, user_id, horarios } = req.body;

    if (user_id && horarios) {
      await supabase.from("suscripciones").upsert({
        user_id,
        subscription,
        horarios,
      }, { onConflict: "user_id" });
    }

    if (title && body) {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
