const contenido = document.getElementById("contenido");
const saludo = document.getElementById("saludo");
const tituloPregunta = document.getElementById("titulo-pregunta");
const textoPregunta = document.getElementById("texto-pregunta");
const formRespuesta = document.getElementById("form-respuesta");
const campoRespuesta = document.getElementById("respuesta");
const btnGuardar = document.getElementById("btn-guardar");
const estado = document.getElementById("estado");
const seccionPareja = document.getElementById("seccion-pareja");
const respuestaPareja = document.getElementById("respuesta-pareja");
const btnSalir = document.getElementById("btn-salir");
const contadorDias = document.getElementById("contador-dias");
const jardin = document.getElementById("jardin");
const jardinVacio = document.getElementById("jardin-vacio");
const pestanas = document.getElementById("pestanas");
const pestanaMia = document.getElementById("pestana-mia");
const pestanaPareja = document.getElementById("pestana-pareja");
const fechaHoy = document.getElementById("fecha-hoy");

let usuario = null;       // la persona con sesión iniciada
let numero = 0;           // número de la pregunta que se está mostrando
let miRespuesta = null;   // mi respuesta guardada (o null si aún no respondo)
let cerrada = false;      // true cuando ya respondimos los dos: ya no se puede editar
let pestanaActual = "mia"; // "mia" o "pareja": qué respuesta se ve en la nube

// Muestra un mensaje bajo la respuesta. tipo: "ok", "error", "cerrado" o nada (neutral)
function ponerEstado(texto, tipo) {
  estado.textContent = texto;
  estado.className = "estado" + (tipo ? " estado--" + tipo : "");
}

// Mi respuesta y la de la pareja comparten el mismo espacio (así todo cabe
// en la pantalla). Las pestañas siguen el patrón de accesibilidad de "tabs".
function mostrarPestana(cual, enfocar = false) {
  pestanaActual = cual;
  const esMia = cual === "mia";
  pestanaMia.setAttribute("aria-selected", String(esMia));
  pestanaPareja.setAttribute("aria-selected", String(!esMia));
  pestanaMia.tabIndex = esMia ? 0 : -1;
  pestanaPareja.tabIndex = esMia ? -1 : 0;
  formRespuesta.hidden = !esMia;
  seccionPareja.hidden = esMia;
  btnGuardar.hidden = !esMia || cerrada;
  if (enfocar) (esMia ? pestanaMia : pestanaPareja).focus();
}

// Sin pregunta que responder: solo se ve el texto de la nube
function ocultarRespuestas() {
  pestanas.hidden = true;
  formRespuesta.hidden = true;
  seccionPareja.hidden = true;
  btnGuardar.hidden = true;
}

pestanaMia.addEventListener("click", () => mostrarPestana("mia"));
pestanaPareja.addEventListener("click", () => mostrarPestana("pareja"));
pestanas.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    const cual = e.key === "Home" ? "mia" : e.key === "End" ? "pareja" : pestanaActual === "mia" ? "pareja" : "mia";
    mostrarPestana(cual, true);
  }
});

// Onda en el botón al guardar (como una gota que cae en un charco)
function onda(boton) {
  boton.classList.remove("onda");
  void boton.offsetWidth; // reinicia la animación
  boton.classList.add("onda");
}

// Protección de la página: si no hay sesión, de regreso al login.
// (Es solo comodidad: la seguridad real son las reglas RLS de la base de datos.)
async function iniciar() {
  const { data } = await db.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
    return;
  }

  usuario = data.session.user;
  pintarTexto(saludo, ["Hola, ", mio(NOMBRES[usuario.email] || usuario.email)]);
  fechaHoy.textContent = fechaLegible(hoyEnMexico());
  contenido.hidden = false;

  // Días juntos: en pantalla solo el número; el lector de pantalla lee la frase completa
  const dias = diasJuntos();
  contadorDias.textContent = dias;
  contadorDias.dataset.cifras = String(dias).length;
  contadorDias.setAttribute("aria-label", dias + (dias === 1 ? " día juntos" : " días juntos"));

  await cargarPregunta();
  await cargarJardin();

  // El botón "Activar avisos" del prado (js/avisos.js); si falla, no pasa nada
  prepararAvisos();

  // Vistas previas sin guardar nada:
  //   home.html?lluvia   → la lluvia completa, terminando con el arcoíris
  //   home.html?arcoiris → solo el arcoíris, dibujándose
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.has("lluvia")) {
    await llover({ conArcoiris: true });
  } else if (parametros.has("arcoiris")) {
    mostrarArcoiris(true);
  }
}

// Las flores (y el brote de mi respuesta, si la pareja aún no responde), en el
// prado. Si falla, simplemente no se muestra.
async function cargarJardin() {
  const prueba = floresDePrueba();
  let flores = prueba;
  let brotes = [];
  if (!prueba) {
    try {
      ({ flores, brotes } = await estadoDelJardin(usuario.id));
    } catch (error) {
      console.error(error.message);
      return;
    }
  }

  const numeros = [...flores, ...brotes].sort((a, b) => a - b);
  jardinVacio.hidden = numeros.length > 0;
  jardin.setAttribute("aria-label", contarJardin(flores.length, brotes.length) + " en el jardín");
  // Las últimas flores que caben en una fila (el aria-label cuenta todas)
  plantarJardin(jardin, numeros, {
    // Hoy: un prado tranquilo, sin desplazarse; las demás flores están en Jardín
    escala: 0.95,
    fijo: true,
    brotes: new Set(brotes),
    // En modo de prueba brotan todas y no se recuerda nada
    nuevas: prueba ? new Set(flores) : floresNuevas(usuario.id, flores),
  });
}

async function cargarPregunta() {
  const hoy = numeroDePreguntaHoy();
  ponerEstado("");
  if (!tormentaEnCurso()) ocultarArcoiris();

  if (hoy < 1) {
    tituloPregunta.textContent = "";
    textoPregunta.textContent = "El diario empieza el " + fechaDePregunta(1) + ".";
    ocultarRespuestas();
    return;
  }

  // Normalmente toca la pregunta de hoy; desde el historial se puede abrir
  // una anterior con home.html?pregunta=5. Nunca una futura.
  const pedida = Number(new URLSearchParams(window.location.search).get("pregunta"));
  numero = pedida >= 1 && pedida <= hoy ? pedida : hoy;

  tituloPregunta.textContent =
    numero === hoy
      ? "Pregunta " + numero
      : "Pregunta " + numero + ", del " + fechaDePregunta(numero);

  // 1) La pregunta
  const { data: pregunta, error: errPregunta } = await db
    .from("preguntas")
    .select("texto")
    .eq("numero", numero)
    .maybeSingle();

  if (errPregunta) {
    console.error(errPregunta.message);
    textoPregunta.textContent = "";
    ocultarRespuestas();
    ponerEstado("No se pudo cargar la pregunta. Recarga la página para intentarlo de nuevo.", "error");
    return;
  }

  if (!pregunta) {
    textoPregunta.textContent = "Todavía no hay pregunta para este día. ¡Hay que agregar más!";
    ocultarRespuestas();
    return;
  }

  textoPregunta.textContent = pregunta.texto;

  // 2) Las respuestas de esta pregunta y los nombres.
  // Las reglas RLS hacen que solo lleguen la mía y, si ya respondí, la de la pareja.
  const [resp, perfiles] = await Promise.all([
    db.from("respuestas").select("id, usuario_id, texto").eq("pregunta_numero", numero),
    db.from("perfiles").select("id, nombre"),
  ]);

  if (resp.error) {
    console.error(resp.error.message);
    ocultarRespuestas();
    ponerEstado("No se pudieron cargar las respuestas. Recarga la página para intentarlo de nuevo.", "error");
    return;
  }

  const lista = resp.data || [];
  const pareja = (perfiles.data || []).find((p) => p.id !== usuario.id);
  const nombrePareja = pareja ? pareja.nombre : "tu pareja";

  miRespuesta = lista.find((r) => r.usuario_id === usuario.id) || null;
  const respuestaDeLaPareja = lista.find((r) => r.usuario_id !== usuario.id) || null;

  // Mi caja de respuesta.
  // Si ya respondimos los dos, queda cerrada: así nadie cambia su respuesta
  // después de leer la del otro. (La base de datos también lo impide.)
  cerrada = Boolean(miRespuesta && respuestaDeLaPareja);
  campoRespuesta.value = miRespuesta ? miRespuesta.texto : "";
  campoRespuesta.readOnly = cerrada;
  formRespuesta.classList.toggle("respuesta-cerrada", cerrada);
  btnGuardar.textContent = miRespuesta ? "Actualizar respuesta" : "Guardar respuesta";

  if (cerrada) {
    borrarLocal(claveBorrador(usuario.id, numero));
    ponerEstado("Respondieron los dos: las respuestas quedan cerradas.", "cerrado");
  } else {
    // Si quedó algo escrito sin guardar, lo recuperamos
    const borrador = leerLocal(claveBorrador(usuario.id, numero));
    if (borrador) campoRespuesta.value = borrador;
  }

  // La respuesta de la pareja
  pintarTexto(pestanaPareja, ["La de ", dePareja(nombrePareja)]);
  pestanaPareja.classList.toggle("esperando", !respuestaDeLaPareja);

  respuestaPareja.classList.toggle("en-espera", !respuestaDeLaPareja);

  if (respuestaDeLaPareja) {
    respuestaPareja.textContent = respuestaDeLaPareja.texto;
  } else if (!miRespuesta) {
    pintarTexto(respuestaPareja, [
      "Cuando guardes tu respuesta, aquí aparecerá la de ",
      dePareja(nombrePareja),
      " (si ya respondió).",
    ]);
  } else {
    pintarTexto(respuestaPareja, [dePareja(nombrePareja), " todavía no responde."]);
  }

  // Si aún no respondo, se abre mi respuesta; si ya respondí, la de la pareja
  pestanas.hidden = false;
  mostrarPestana(miRespuesta ? "pareja" : "mia");

  // El arcoíris se queda todo el día cuando ya respondí la pregunta de hoy
  // (si está lloviendo, lo saca la propia tormenta al despejarse)
  if (miRespuesta && numero === hoy && !tormentaEnCurso()) mostrarArcoiris(false);
}

// Cada vez que escribes, se guarda un borrador en este navegador
campoRespuesta.addEventListener("input", () => {
  if (!usuario || !numero || cerrada) return;
  guardarLocal(claveBorrador(usuario.id, numero), campoRespuesta.value);
});

formRespuesta.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (cerrada) return;
  const texto = campoRespuesta.value.trim();
  if (!texto) return;

  btnGuardar.disabled = true;
  onda(btnGuardar);
  ponerEstado("Guardando...");

  let error;
  if (miRespuesta) {
    // Ya había respondido: actualizamos esa misma respuesta.
    // Si mientras tanto la pareja respondió, la base de datos no deja editar:
    // no da error, simplemente no cambia ninguna fila (data llega vacío).
    let data;
    ({ data, error } = await db
      .from("respuestas")
      .update({ texto })
      .eq("id", miRespuesta.id)
      .select("id"));

    if (!error && data.length === 0) {
      btnGuardar.disabled = false;
      await cargarPregunta();
      ponerEstado("Tu pareja ya respondió; tu respuesta quedó cerrada.", "cerrado");
      return;
    }
  } else {
    // Primera vez: creamos la respuesta (usuario_id se llena solo en la base de datos)
    ({ error } = await db.from("respuestas").insert({ pregunta_numero: numero, texto }));
  }

  btnGuardar.disabled = false;

  if (error) {
    console.error(error.message);
    ponerEstado("No se pudo guardar. Intenta de nuevo.", "error");
    return;
  }

  borrarLocal(claveBorrador(usuario.id, numero));

  // Cada vez que guardas, llueve y se riega el jardín (unos 6 s, no se puede saltar).
  // Mientras tanto, por debajo, se recarga la pregunta.
  const lluvia = llover({ conArcoiris: numero === numeroDePreguntaHoy() });
  await cargarPregunta();
  await lluvia;

  // Después de la lluvia aparece el brote de mi respuesta o, si ya respondimos
  // los dos, florece
  await cargarJardin();
  ponerEstado(
    cerrada
      ? "¡Guardado! Respondieron los dos: las respuestas quedan cerradas."
      : "¡Guardado!",
    "ok"
  );
});

btnSalir.addEventListener("click", async () => {
  await db.auth.signOut();
  window.location.href = "index.html";
});

iniciar();
