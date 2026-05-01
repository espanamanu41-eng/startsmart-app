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

const DIAS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MSGS_MANANA = [
  "¡Nuevo día, nueva oportunidad de vender! 🚀",
  "¡Buenos días! Hoy puede ser tu mejor día de ventas 💪",
  "¡Arriba! Tu negocio te necesita hoy 🔥",
  "Cada venta cuenta. ¡Empieza fuerte! ⚡",
];
const MSGS_MEDIO = [
  "¿Ya registraste tus ventas de esta mañana? 📊",
  "Mitad del día — ¿cómo van las ventas? Anótalas 📝",
  "¡No dejes para después! Registra tus movimientos 💰",
];
const MSGS_NOCHE = [
  "¿Ya cerraste el día? No olvides anotar todo 🌙",
  "Último recordatorio del día — ¿registraste todo? ✅",
  "Buen trabajo hoy. Ahora anota tus ventas finales 📈",
];

function randomMsg(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

exports.handler = async function(event) {
  try {
    const { data: suscripciones } = await supabase.from("suscripciones").select("*");
    if (!suscripciones || suscripciones.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, enviadas: 0 }) };
    }

    let enviadas = 0;

    for (const sub of suscripciones) {
      const timezone = sub.timezone || "America/Tijuana";
      const ahora = new Date();

      const horaStr = ahora.toLocaleString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      const diaStr = ahora.toLocaleString("en-US", {
        timeZone: timezone,
        weekday: "short"
      });

      const diaIdx = DIAS_EN.findIndex(d => diaStr.toLowerCase() === d.toLowerCase());
      if (diaIdx === -1) continue;

      const [hActual, mActual] = horaStr.split(":").map(Number);
      const minutosAhora = hActual * 60 + mActual;

      const horarios = sub.horarios;
      if (!horarios || !horarios[diaIdx]?.activo) continue;

      const horario = horarios[diaIdx];
      const [hAp, mAp] = horario.apertura.split(":").map(Number);
      const [hCi, mCi] = horario.cierre.split(":").map(Number);

      const minutosApertura = hAp * 60 + mAp;
      const minutosCierre = hCi * 60 + mCi;
      const minutosMedio = Math.floor((minutosApertura + minutosCierre) / 2);
      const minutosCierreNotif = minutosCierre - 30;

      let titulo = null;
      let cuerpo = null;

      if (Math.abs(minutosAhora - minutosApertura) <= 6) {
        titulo = "StartSmart 🌅";
        cuerpo = randomMsg(MSGS_MANANA);
      } else if (Math.abs(minutosAhora - minutosMedio) <= 6) {
        titulo = "StartSmart ☀️";
        cuerpo = randomMsg(MSGS_MEDIO);
      } else if (Math.abs(minutosAhora - minutosCierreNotif) <= 6) {
        titulo = "StartSmart 🌙";
        cuerpo = randomMsg(MSGS_NOCHE);
      }

      if (titulo && cuerpo) {
        try {
          const subscriptionObj = typeof sub.subscription === 'string'
            ? JSON.parse(sub.subscription)
            : sub.subscription;
          await webpush.sendNotification(
            subscriptionObj,
            JSON.stringify({ title: titulo, body: cuerpo })
          );
          enviadas++;
        } catch (e) {
          if (e.statusCode === 410) {
            await supabase.from("suscripciones").delete().eq("id", sub.id);
          }
        }
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, enviadas }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
