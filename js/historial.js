const contenido = document.getElementById("contenido");
const lista = document.getElementById("lista");
const btnSalir = document.getElementById("btn-salir");

// Crea un bloque "Nombre: texto". Se usa textContent (no innerHTML) a propósito:
// así, si una respuesta contiene símbolos como < o >, se muestran como texto
// y nunca se ejecutan como código.
function crearBloque(titulo, texto, esDeLaPareja) {
  const bloque = document.createElement("div");
  bloque.className = "respuesta " + (esDeLaPareja ? "respuesta--pareja" : "respuesta--mia");

  const negrita = document.createElement("strong");
  negrita.textContent = titulo;
  bloque.appendChild(negrita);

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;
  bloque.appendChild(parrafo);

  return bloque;
}

// Bloque para una respuesta que todavía no se puede mostrar.
// "partes" es lo mismo que recibe pintarTexto (textos y nombres remarcados).
function crearPendiente(partes, enlace) {
  const bloque = document.createElement("div");
  bloque.className = "respuesta respuesta--pendiente";

  const parrafo = document.createElement("p");
  pintarTexto(parrafo, partes);
  bloque.appendChild(parrafo);

  if (enlace) bloque.appendChild(enlace);
  return bloque;
}

function dibujar(preguntas, respuestas, perfiles, miId) {
  lista.textContent = "";

  const pareja = perfiles.find((p) => p.id !== miId);
  const yo = perfiles.find((p) => p.id === miId);
  const nombrePareja = pareja ? pareja.nombre : "Tu pareja";
  const miNombre = yo ? yo.nombre : "Tú";

  // Agrupamos las respuestas por número de pregunta
  const porPregunta = {};
  for (const r of respuestas) {
    if (!porPregunta[r.pregunta_numero]) porPregunta[r.pregunta_numero] = [];
    porPregunta[r.pregunta_numero].push(r);
  }

  // De la más reciente a la más antigua
  const ordenadas = [...preguntas].sort((a, b) => b.numero - a.numero);

  for (const pregunta of ordenadas) {
    const delDia = porPregunta[pregunta.numero] || [];
    const mia = delDia.find((r) => r.usuario_id === miId);
    const deLaPareja = delDia.find((r) => r.usuario_id !== miId);

    const articulo = document.createElement("article");
    articulo.className = "tarjeta dia";

    const etiqueta = document.createElement("p");
    etiqueta.className = "etiqueta";
    etiqueta.textContent = "#" + pregunta.numero + " · " + fechaDePregunta(pregunta.numero);
    articulo.appendChild(etiqueta);

    const titulo = document.createElement("h3");
    titulo.textContent = pregunta.texto;
    articulo.appendChild(titulo);

    const respuestas = document.createElement("div");
    respuestas.className = "respuestas";
    articulo.appendChild(respuestas);

    // Mi respuesta
    if (mia) {
      respuestas.appendChild(crearBloque(miNombre, mia.texto, false));
    } else {
      const enlace = document.createElement("a");
      enlace.className = "btn-mini";
      enlace.href = "home.html?pregunta=" + pregunta.numero;
      enlace.textContent = "Responder";
      respuestas.appendChild(crearPendiente(["Aún no respondes esta pregunta."], enlace));
    }

    // Respuesta de la pareja (solo llega si yo ya respondí; lo decide la base de datos)
    if (deLaPareja) {
      respuestas.appendChild(crearBloque(nombrePareja, deLaPareja.texto, true));
    } else if (!mia) {
      respuestas.appendChild(
        crearPendiente([
          "La respuesta de ",
          dePareja(nombrePareja),
          " se mostrará cuando respondas la tuya.",
        ])
      );
    } else {
      respuestas.appendChild(crearPendiente([dePareja(nombrePareja), " todavía no responde."]));
    }

    lista.appendChild(articulo);
  }
}

async function iniciar() {
  const { data } = await db.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
    return;
  }

  contenido.hidden = false;

  const hoy = numeroDePreguntaHoy();
  if (hoy < 1) {
    lista.textContent = "El diario empieza el " + fechaDePregunta(1) + ".";
    return;
  }

  try {
    const [preguntas, respuestas, perfiles] = await Promise.all([
      traerTodo("preguntas", "numero, texto", "numero", (q) => q.lte("numero", hoy)),
      traerTodo("respuestas", "id, usuario_id, pregunta_numero, texto", "id"),
      traerTodo("perfiles", "id, nombre", "nombre"),
    ]);

    if (preguntas.length === 0) {
      lista.textContent = "Todavía no hay preguntas.";
      return;
    }

    dibujar(preguntas, respuestas, perfiles, data.session.user.id);
  } catch (error) {
    console.error(error.message);
    lista.textContent = "No se pudo cargar el historial. Intenta de nuevo.";
  }
}

btnSalir.addEventListener("click", async () => {
  await db.auth.signOut();
  window.location.href = "index.html";
});

iniciar();
