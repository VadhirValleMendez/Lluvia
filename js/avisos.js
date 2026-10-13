// Notificaciones en el móvil (Web Push): recordatorio si no has respondido
// (13:00 y 21:00), aviso cuando tu pareja responde y cuando sale la pregunta
// nueva (7:00). Los manda la Edge Function "avisos" de Supabase (ver
// supabase/AVISOS.md); aquí solo se pide permiso y se guarda la suscripción.
//
// El permiso solo se puede pedir tras un toque, por eso hay un botón.
// En iPhone solo funcionan con Lluvia añadida a la pantalla de inicio (iOS 16.4+).

const btnAvisos = document.getElementById("btn-avisos");
const mensajeAvisos = document.getElementById("mensaje-avisos");

const ADMITE_AVISOS = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const ES_IPHONE = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const ESTA_INSTALADA = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

let relojMensaje = null;

// Un mensaje corto sobre el pasto, que se va solo
function decirAvisos(texto) {
  mensajeAvisos.textContent = texto;
  mensajeAvisos.hidden = false;
  clearTimeout(relojMensaje);
  relojMensaje = setTimeout(() => (mensajeAvisos.hidden = true), 8000);
}

// La llave pública viene en base64url; el navegador la quiere en bytes
function llaveEnBytes(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binario, (letra) => letra.charCodeAt(0));
}

// Guarda (o actualiza) la suscripción de este dispositivo.
// usuario_id lo pone la base de datos; las reglas RLS solo dejan tocar las mías.
async function guardarSuscripcion(suscripcion) {
  const { endpoint, keys } = suscripcion.toJSON();
  const { error } = await db
    .from("suscripciones_push")
    .upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: "endpoint" });
  if (error) throw error;
}

function marcarActivados() {
  btnAvisos.textContent = "Avisos activados";
  btnAvisos.onclick = () => decirAvisos("Los avisos están activados en este dispositivo.");
}

async function activarAvisos(registro) {
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") {
    decirAvisos("Sin permiso no se pueden mandar avisos. Puedes activarlos cuando quieras.");
    return;
  }
  try {
    const suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: llaveEnBytes(VAPID_PUBLICA),
    });
    await guardarSuscripcion(suscripcion);
    marcarActivados();
    decirAvisos("Listo: te avisaremos cuando salga la pregunta, a las 13:00 y 21:00 si no has respondido, y cuando tu pareja responda.");
  } catch (error) {
    console.error(error.message || error);
    decirAvisos("No se pudieron activar los avisos. Inténtalo de nuevo más tarde.");
  }
}

// Se llama desde home.js cuando ya hay sesión
async function prepararAvisos() {
  if (!ADMITE_AVISOS) {
    // iPhone en Safari, sin instalar: se explica cómo hacerlo
    if (ES_IPHONE && !ESTA_INSTALADA) {
      btnAvisos.hidden = false;
      btnAvisos.onclick = () =>
        decirAvisos("En iPhone, primero añade Lluvia a la pantalla de inicio (Compartir → Añadir a pantalla de inicio) y ábrela desde ahí.");
    }
    return;
  }

  btnAvisos.hidden = false;
  try {
    const registro = await navigator.serviceWorker.register("sw.js");

    if (Notification.permission === "denied") {
      btnAvisos.textContent = "Avisos bloqueados";
      btnAvisos.onclick = () =>
        decirAvisos("Los avisos están bloqueados para Lluvia. Actívalos en los ajustes del navegador (permisos del sitio → Notificaciones).");
      return;
    }

    const actual = await registro.pushManager.getSubscription();
    if (Notification.permission === "granted" && actual) {
      await guardarSuscripcion(actual); // por si cambió o se borró en la base de datos
      marcarActivados();
      return;
    }

    btnAvisos.onclick = () => activarAvisos(registro);
  } catch (error) {
    console.error(error.message || error);
    btnAvisos.hidden = true;
  }
}
