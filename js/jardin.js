const jardin = document.getElementById("jardin");
const mensaje = document.getElementById("mensaje-jardin");
const cuentaJardin = document.getElementById("cuenta-jardin");

async function iniciar() {
  const sesion = await exigirSesion();
  if (!sesion) return;

  const miId = sesion.user.id;
  const prueba = floresDePrueba();
  let flores, brotes, brotecitos;
  let respondiHoy = false;
  let nombrePareja = "tu pareja";
  if (prueba) {
    ({ flores, brotes, brotecitos } = prueba);
  } else {
    try {
      const [estado, perfiles] = await Promise.all([
        estadoDelJardin(miId),
        db.from("perfiles").select("id, nombre"),
      ]);
      ({ flores, brotes, brotecitos, respondiHoy } = estado);
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

  const numeros = [...flores, ...brotes, ...brotecitos].sort((a, b) => a - b);
  // El mensaje se queda mientras no haya ni flores ni brotes (los brotecitos crecen debajo)
  if (flores.length + brotes.length === 0) {
    mensaje.textContent = "Respondan los dos la pregunta de hoy y brotará la primera flor.";
  } else {
    mensaje.hidden = true;
  }
  if (numeros.length === 0) return;

  // Debajo del título: cuántas flores, brotes y brotecitos hay
  const cuenta = contarJardin(flores.length, brotes.length, brotecitos.length);
  cuentaJardin.textContent = cuenta;
  cuentaJardin.hidden = false;
  jardin.setAttribute("aria-label", "Jardín: " + cuenta);

  // Las flores llenan el alto del prado; si no caben a lo ancho, el prado se desplaza
  plantarJardin(jardin, numeros, {
    brotes: new Set(brotes),
    brotecitos: new Set(brotecitos),
    nombrePareja,
    // En modo de prueba brotan todas y no se recuerda nada
    nuevas: prueba ? new Set(flores) : floresNuevas(miId, flores),
    enlaces: true,
    escala: 1.15, // aquí el prado es el protagonista: flores un poco más grandes
  });
}

iniciar();
