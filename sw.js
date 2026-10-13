// Service worker de Lluvia: solo sirve para las notificaciones (Web Push).
// No guarda nada en caché: la web siempre se carga de internet.
// Los avisos los manda la Edge Function "avisos" de Supabase (supabase/AVISOS.md).

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Llega un aviso: { titulo, cuerpo, url }
self.addEventListener("push", (e) => {
  let datos = {};
  try {
    datos = e.data ? e.data.json() : {};
  } catch {
    datos = { cuerpo: e.data ? e.data.text() : "" };
  }

  e.waitUntil(
    self.registration.showNotification(datos.titulo || "Lluvia", {
      body: datos.cuerpo || "",
      icon: "iconos/icono-192.png",
      badge: "iconos/icono-192.png",
      lang: "es",
      tag: datos.tipo || "lluvia", // un aviso del mismo tipo reemplaza al anterior
      data: { url: datos.url || "home.html" },
    })
  );
});

// Al tocar el aviso: si Lluvia ya está abierta, se enfoca; si no, se abre
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const destino = new URL(e.notification.data.url, self.registration.scope).href;

  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const ventana of ventanas) {
        if (ventana.url.startsWith(self.registration.scope) && "focus" in ventana) {
          ventana.navigate(destino);
          return ventana.focus();
        }
      }
      return self.clients.openWindow(destino);
    })
  );
});
