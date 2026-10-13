const contenido = document.getElementById("contenido");
const jardin = document.getElementById("jardin");
const mensaje = document.getElementById("mensaje-jardin");
const btnSalir = document.getElementById("btn-salir");

// Protección de la página: si no hay sesión, de regreso al login.
// (Es solo comodidad: la seguridad real son las reglas RLS de la base de datos.)
async function iniciar() {
  const { data } = await db.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
    return;
  }

  contenido.hidden = false;

  const miId = data.session.user.id;
  const prueba = floresDePrueba();
  let flores = prueba;
  let brotes = [];
  let respondiHoy = false;
  let nombrePareja = "tu pareja";
  if (!prueba) {
    try {
      const [estado, perfiles] = await Promise.all([
        estadoDelJardin(miId),
        db.from("perfiles").select("id, nombre"),
      ]);
      ({ flores, brotes, respondiHoy } = estado);
      const pareja = (perfiles.data || []).find((p) => p.id !== miId);
      if (pareja) nombrePareja = pareja.nombre;
    } catch (error) {
      console.error(error.message);
      mensaje.textContent = "No se pudo cargar el jardín. Recarga la página para intentarlo de nuevo.";
      return;
    }
  }

  // El arcoíris: ya respondí la pregunta de hoy
  if (respondiHoy) mostrarArcoiris(false);

  const numeros = [...flores, ...brotes].sort((a, b) => a - b);
  if (numeros.length === 0) {
    mensaje.textContent = "Respondan los dos la pregunta de hoy y brotará la primera flor.";
    return;
  }

  mensaje.hidden = true;
  // En pantalla solo dice "Jardín"; el lector de pantalla oye cuántas flores hay
  jardin.setAttribute("aria-label", "Jardín: " + contarJardin(flores.length, brotes.length));

  // Las flores llenan el alto del prado; si no caben a lo ancho, el prado se desplaza
  plantarJardin(jardin, numeros, {
    brotes: new Set(brotes),
    nombrePareja,
    // En modo de prueba brotan todas y no se recuerda nada
    nuevas: prueba ? new Set(flores) : floresNuevas(miId, flores),
    enlaces: true,
    escala: 1.15, // aquí el prado es el protagonista: flores un poco más grandes
  });
}

btnSalir.addEventListener("click", async () => {
  await db.auth.signOut();
  window.location.href = "index.html";
});

iniciar();
