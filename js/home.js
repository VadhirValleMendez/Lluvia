const contenido = document.getElementById("contenido");
const saludo = document.getElementById("saludo");
const tituloPregunta = document.getElementById("titulo-pregunta");
const textoPregunta = document.getElementById("texto-pregunta");
const formRespuesta = document.getElementById("form-respuesta");
const campoRespuesta = document.getElementById("respuesta");
const btnGuardar = document.getElementById("btn-guardar");
const estado = document.getElementById("estado");
const seccionPareja = document.getElementById("seccion-pareja");
const tituloPareja = document.getElementById("titulo-pareja");
const respuestaPareja = document.getElementById("respuesta-pareja");
const btnSalir = document.getElementById("btn-salir");
const contadorDias = document.getElementById("contador-dias");

let usuario = null;       // la persona con sesión iniciada
let numero = 0;           // número de la pregunta que se está mostrando
let miRespuesta = null;   // mi respuesta guardada (o null si aún no respondo)
let cerrada = false;      // true cuando ya respondimos los dos: ya no se puede editar

// Muestra un mensaje bajo la respuesta. tipo: "ok", "error", "cerrado" o nada (neutral)
function ponerEstado(texto, tipo) {
  estado.textContent = texto;
  estado.className = "estado" + (tipo ? " estado--" + tipo : "");
}

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
  saludo.textContent = "Hola, " + (NOMBRES[usuario.email] || usuario.email);
  contenido.hidden = false;

  await cargarPregunta();

  const dias = diasJuntos();
  contadorDias.textContent = "Llevamos " + dias + (dias === 1 ? " día" : " días") + " juntos";

}

async function cargarPregunta() {
  const hoy = numeroDePreguntaHoy();
  ponerEstado("");

  if (hoy < 1) {
    tituloPregunta.textContent = "Pregunta del día";
    textoPregunta.textContent = "El diario empieza el " + fechaDePregunta(1) + ".";
    formRespuesta.hidden = true;
    seccionPareja.hidden = true;
    return;
  }

  // Normalmente toca la pregunta de hoy; desde el historial se puede abrir
  // una anterior con home.html?pregunta=5. Nunca una futura.
  const pedida = Number(new URLSearchParams(window.location.search).get("pregunta"));
  numero = pedida >= 1 && pedida <= hoy ? pedida : hoy;

  tituloPregunta.textContent =
    numero === hoy
      ? "Pregunta de hoy · #" + numero
      : "Pregunta #" + numero + " · " + fechaDePregunta(numero);

  // 1) La pregunta
  const { data: pregunta, error: errPregunta } = await db
    .from("preguntas")
    .select("texto")
    .eq("numero", numero)
    .maybeSingle();

  if (errPregunta) {
    console.error(errPregunta.message);
    textoPregunta.textContent = "";
    ponerEstado("No se pudo cargar la pregunta. Intenta de nuevo.", "error");
    return;
  }

  if (!pregunta) {
    textoPregunta.textContent = "Todavía no hay pregunta para este día. ¡Hay que agregar más!";
    formRespuesta.hidden = true;
    seccionPareja.hidden = true;
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
    ponerEstado("No se pudieron cargar las respuestas.", "error");
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
  formRespuesta.hidden = false;
  campoRespuesta.value = miRespuesta ? miRespuesta.texto : "";
  campoRespuesta.readOnly = cerrada;
  formRespuesta.classList.toggle("respuesta-cerrada", cerrada);
  btnGuardar.hidden = cerrada;
  btnGuardar.textContent = miRespuesta ? "Actualizar respuesta" : "Guardar respuesta";

  if (cerrada) {
    borrarBorrador(claveBorrador(usuario.id, numero));
    ponerEstado("Las dos respuestas están guardadas; ya no se pueden editar.", "cerrado");
  } else {
    // Si quedó algo escrito sin guardar, lo recuperamos
    const borrador = leerBorrador(claveBorrador(usuario.id, numero));
    if (borrador) campoRespuesta.value = borrador;
  }

  // La respuesta de la pareja
  seccionPareja.hidden = false;
  tituloPareja.textContent = "Respuesta de " + nombrePareja;

  respuestaPareja.classList.toggle("en-espera", !respuestaDeLaPareja);

  if (respuestaDeLaPareja) {
    respuestaPareja.textContent = respuestaDeLaPareja.texto;
  } else if (!miRespuesta) {
    respuestaPareja.textContent =
      "Cuando guardes tu respuesta, aquí aparecerá la de " + nombrePareja + " (si ya respondió).";
  } else {
    respuestaPareja.textContent = nombrePareja + " todavía no responde.";
  }
}

// Cada vez que escribes, se guarda un borrador en este navegador
campoRespuesta.addEventListener("input", () => {
  if (!usuario || !numero || cerrada) return;
  guardarBorrador(claveBorrador(usuario.id, numero), campoRespuesta.value);
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

  borrarBorrador(claveBorrador(usuario.id, numero));
  await cargarPregunta();
  ponerEstado(
    cerrada
      ? "¡Guardado! Ya respondieron los dos, así que las respuestas quedan cerradas."
      : "¡Guardado!",
    "ok"
  );
});

btnSalir.addEventListener("click", async () => {
  await db.auth.signOut();
  window.location.href = "index.html";
});

iniciar();
