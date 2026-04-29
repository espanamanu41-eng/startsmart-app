import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const MSGS_MANANA = [
  "¡Nuevo día, nueva oportunidad de vender! 🚀",
  "¡Buenos días! Hoy puede ser tu mejor día de ventas 💪",
  "¡Arriba! Tu negocio te necesita hoy 🔥",
  "Cada venta cuenta. ¡Empieza fuerte! ⚡",
  "¡El éxito empieza con el primer cliente del día! 🌟",
];
const MSGS_MEDIO = [
  "¿Ya registraste tus ventas de esta mañana? 📊",
  "Mitad del día — ¿cómo van las ventas? Anótalas 📝",
  "¡No dejes para después! Registra tus movimientos 💰",
  "Un negocio ordenado es un negocio exitoso. ¡Anota! ✍️",
];
const MSGS_NOCHE = [
  "¿Ya cerraste el día? No olvides anotar todo 🌙",
  "Último recordatorio del día — ¿registraste todo? ✅",
  "Buen trabajo hoy. Ahora anota tus ventas finales 📈",
  "¡No pierdas ni un peso! Registra antes de cerrar 💼",
];

function randomMsg(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function handler(req, res) {
  try {
    const ahora = new Date();
    const horaActual = ahora.toLocaleString("en-US", { timeZone: "America/Tijuana", hour: "2-digit", minute: "2-digit", hour12: false });
    const diaActual = ahora.toLocaleString("en-US", { timeZone: "America/Tijuana", weekday: "short" });
    const diaIdx = DIAS.findIndex(d => diaActual.startsWith(d.slice(0, 3)));

    const { data: suscripciones } = await supabase.from("suscripciones").select("*");
    if (!suscripciones || suscripciones.length === 0) return res.status(200).json({ ok: true, enviadas: 0 });

    let enviadas = 0;

    for (const sub of suscripciones) {
      const horarios = sub.horarios;
      if (!horarios || !horarios[diaIdx]?.activo) continue;

      const horario = horarios[diaIdx];
      const [hAp, mAp] = horario.apertura.split(":").map(Number);
      const [hCi, mCi] = horario.cierre.split(":").map(Number);
      const [hActual, mActual] = horaActual.split(":").map(Number);

      const minutosAhora = hActual * 60 + mActual;
      const minutosApertura = hAp * 60 + mAp;
      const minutosCierre = hCi * 60 + mCi;
      const minutosMedio = Math.floor((minutosApertura + minutosCierre) / 2);
      const minutosCierreNotif = minutosCierre - 30;

      let titulo = null;
      let cuerpo = null;

      if (Math.abs(minutosAhora - minutosApertura) <= 1) {
        titulo = "StartSmart 🌅";
        cuerpo = randomMsg(MSGS_MANANA);
      } else if (Math.abs(minutosAhora - minutosMedio) <= 1) {
        titulo = "StartSmart ☀️";
        cuerpo = randomMsg(MSGS_MEDIO);
      } else if (Math.abs(minutosAhora - minutosCierreNotif) <= 1) {
        titulo = "StartSmart 🌙";
        cuerpo = randomMsg(MSGS_NOCHE);
      }

      if (titulo && cuerpo) {
        try {
          await webpush.sendNotification(sub.subscription, JSON.stringify({ title: titulo, body: cuerpo }));
          enviadas++;
        } catch (e) {
          if (e.statusCode === 410) {
            await supabase.from("suscripciones").delete().eq("id", sub.id);
          }
        }
      }
    }

    return res.status(200).json({ ok: true, enviadas });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
