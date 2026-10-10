const contenido = document.getElementById("contenido");
const lista = document.getElementById("lista");
const btnSalir = document.getElementById("btn-salir");

// Crea un bloque "Nombre: texto". Se usa textContent (no innerHTML) a propósito:
// así, si una respuesta contiene símbolos como < o >, se muestran como texto
// y nunca se ejecutan como código.
function crearBloque(titulo, texto) {
  const bloque = document.createElement("div");

  const negrita = document.createElement("strong");
  negrita.textContent = titulo;
  bloque.appendChild(negrita);

  const parrafo = document.createElement("p");
  parrafo.style.whiteSpace = "pre-wrap"; // respeta los saltos de línea
  parrafo.textContent = texto;
  bloque.appendChild(parrafo);

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

    const titulo = document.createElement("h3");
    titulo.textContent = "#" + pregunta.numero + " · " + fechaDePregunta(pregunta.numero);
    articulo.appendChild(titulo);

    const texto = document.createElement("p");
    texto.textContent = pregunta.texto;
    articulo.appendChild(texto);

    // Mi respuesta
    if (mia) {
      articulo.appendChild(crearBloque(miNombre, mia.texto));
    } else {
      const aviso = document.createElement("p");
      aviso.textContent = "Aún no respondes esta pregunta. ";
      const enlace = document.createElement("a");
      enlace.href = "home.html?pregunta=" + pregunta.numero;
      enlace.textContent = "Responder";
      aviso.appendChild(enlace);
      articulo.appendChild(aviso);
    }

    // Respuesta de la pareja (solo llega si yo ya respondí; lo decide la base de datos)
    if (deLaPareja) {
      articulo.appendChild(crearBloque(nombrePareja, deLaPareja.texto));
    } else if (!mia) {
      const aviso = document.createElement("p");
      aviso.textContent = "La respuesta de " + nombrePareja + " se mostrará cuando respondas la tuya.";
      articulo.appendChild(aviso);
    } else {
      const aviso = document.createElement("p");
      aviso.textContent = nombrePareja + " todavía no responde.";
      articulo.appendChild(aviso);
    }

    lista.appendChild(articulo);
    lista.appendChild(document.createElement("hr"));
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
