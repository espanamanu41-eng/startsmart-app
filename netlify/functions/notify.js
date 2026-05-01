const webpush = require("web-push");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { subscription, title, body, user_id, horarios, timezone } = JSON.parse(event.body);

    if (user_id && horarios) {
      await supabase.from("suscripciones").upsert({
        user_id,
        subscription,
        horarios,
        timezone: timezone || "America/Tijuana",
      }, { onConflict: "user_id" });
    }

    if (title && body && subscription) {
      const subscriptionObj = typeof subscription === 'string'
        ? JSON.parse(subscription)
        : subscription;
      await webpush.sendNotification(subscriptionObj, JSON.stringify({ title, body }));
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
