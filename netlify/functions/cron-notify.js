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

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MSGS_MANANA = ["¡Nuevo día, nueva oportunidad de vender! 🚀"];
const MSGS_MEDIO = ["¿Ya registraste tus ventas? 📊"];
const MSGS_NOCHE = ["¿Ya cerraste el día? 🌙"];

function randomMsg(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

exports.handler = async function(event) {
  try {
    const ahora = new Date();
    const horaStr = ahora.toLocaleString("en-US", {
      timeZone: "America/Tijuana",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    const diaStr = ahora.toLocaleString("en-US", {
      timeZone: "America/Tijuana",
      weekday: "short"
    });

    const diaIdx = DIAS.findIndex(d => diaStr.toLowerCase().startsWith(d.toLowerCase().slice(0, 3)));
    const [hActual, mActual] = horaStr.split(":").map(Number);
    const minutosAhora = hActual * 60 + mActual;

    const logs = [`Hora: ${horaStr}, Dia: ${diaStr}, diaIdx: ${diaIdx}, minutosAhora: ${minutosAhora}`];

    const { data: suscripciones } = await supabase.from("suscripciones").select("*");
    if (!suscripciones || suscripciones.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, enviadas: 0, logs }) };
    }

    logs.push(`Suscripciones encontradas: ${suscripciones.length}`);
    let enviadas = 0;

    for (const sub of suscripciones) {
      const horarios = sub.horarios;
      const horarioDelDia = horarios?.[diaIdx];
      logs.push(`Horario del dia: ${JSON.stringify(horarioDelDia)}`);

      if (!horarioDelDia?.activo) {
        logs.push("Dia no activo, saltando");
        continue;
      }

      const [hAp, mAp] = horarioDelDia.apertura.split(":").map(Number);
      const [hCi, mCi] = horarioDelDia.cierre.split(":").map(Number);
      const minutosApertura = hAp * 60 + mAp;
      const minutosCierre = hCi * 60 + mCi;
      const minutosMedio = Math.floor((minutosApertura + minutosCierre) / 2);
      const minutosCierreNotif = minutosCierre - 30;

      logs.push(`minutosApertura: ${minutosApertura}, minutosAhora: ${minutosAhora}, diff: ${Math.abs(minutosAhora - minutosApertura)}`);

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

      logs.push(`titulo: ${titulo}`);

      if (titulo && cuerpo) {
        try {
          const subscriptionObj = typeof sub.subscription === 'string'
            ? JSON.parse(sub.subscription)
            : sub.subscription;
          await webpush.sendNotification(subscriptionObj, JSON.stringify({ title: titulo, body: cuerpo }));
          enviadas++;
          logs.push("Notificacion enviada!");
        } catch (e) {
          logs.push(`Error enviando: ${e.message}`);
          if (e.statusCode === 410) {
            await supabase.from("suscripciones").delete().eq("id", sub.id);
          }
        }
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, enviadas, logs }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}
