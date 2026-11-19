const lista = document.getElementById("lista");

// Mensaje suelto en lugar de la lista (cargando, vacío, error)
function ponerAviso(texto) {
  const aviso = document.createElement("p");
  aviso.className = "aviso";
  aviso.textContent = texto;
  lista.replaceChildren(aviso);
}

// Crea un bloque "Nombre: texto". Se usa textContent (no innerHTML) a propósito:
// así, si una respuesta contiene símbolos como < o >, se muestran como texto
// y nunca se ejecutan como código.
// Junto al nombre va la gota de cómo se sintió (si la respuesta tiene ánimo:
// las de antes de que existieran los ánimos no lo tienen).
function crearBloque(titulo, texto, esDeLaPareja, animo) {
  const bloque = document.createElement("div");
  bloque.className = "respuesta " + (esDeLaPareja ? "respuesta--pareja" : "respuesta--mia");

  const cabecera = document.createElement("div");
  cabecera.className = "respuesta__cabecera";
  const negrita = document.createElement("strong");
  negrita.textContent = titulo;
  cabecera.appendChild(negrita);
  if (nombreAnimo(animo)) {
    cabecera.appendChild(crearCaraAnimo(animo, { etiqueta: "Cómo se sintió: " + nombreAnimo(animo) }));
  }
  bloque.appendChild(cabecera);

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
    articulo.className = "dia";
    // Lo que encuentra el buscador: la fecha, la pregunta, las respuestas visibles
    // y los ánimos (por nombre, "tristeza", o por clave, "triste")
    const animosDelDia = [mia?.animo, deLaPareja?.animo].filter((a) => nombreAnimo(a));
    articulo.dataset.numero = pregunta.numero;
    articulo.dataset.busqueda = sinAcentos(
      [
        fechaDePregunta(pregunta.numero), pregunta.texto, mia?.texto, deLaPareja?.texto,
        ...animosDelDia, ...animosDelDia.map(nombreAnimo),
      ].join(" ")
    );

    const etiqueta = document.createElement("p");
    etiqueta.className = "numero-pregunta";
    etiqueta.textContent = "Pregunta " + pregunta.numero + ", del " + fechaDePregunta(pregunta.numero);
    articulo.appendChild(etiqueta);

    const titulo = document.createElement("h2");
    titulo.textContent = pregunta.texto;
    articulo.appendChild(titulo);

    const respuestas = document.createElement("div");
    respuestas.className = "respuestas";
    articulo.appendChild(respuestas);

    // Mi respuesta
    if (mia) {
      respuestas.appendChild(crearBloque(miNombre, mia.texto, false, mia.animo));
    } else {
      const enlace = document.createElement("a");
      enlace.className = "btn-mini";
      enlace.href = "home.html?pregunta=" + pregunta.numero;
      enlace.textContent = "Responder";
      respuestas.appendChild(crearPendiente(["Aún no respondes esta pregunta."], enlace));
    }

    // Respuesta de la pareja (solo llega si yo ya respondí; lo decide la base de datos)
    if (deLaPareja) {
      respuestas.appendChild(crearBloque(nombrePareja, deLaPareja.texto, true, deLaPareja.animo));
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

  sinResultados.hidden = true;
  lista.appendChild(sinResultados);
}

// ---------- El buscador ----------

const buscador = document.getElementById("buscador");
const campoBuscar = document.getElementById("buscar");
const resultadoBusqueda = document.getElementById("resultado-busqueda");
const sinResultados = document.createElement("p");
sinResultados.className = "aviso";

// En minúsculas y sin acentos, para que "cancion" encuentre "canción"
function sinAcentos(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Deja visibles solo los días que tienen todas las palabras buscadas.
// Un número solo ("5", "#5" o "pregunta 5") busca esa pregunta exacta.
function buscar() {
  const buscado = campoBuscar.value.trim();
  const termino = sinAcentos(buscado);
  const numero = termino.match(/^(?:pregunta\s*)?#?(\d+)$/);
  const palabras = termino.split(/\s+/).filter(Boolean);
  let vistos = 0;

  for (const dia of lista.querySelectorAll(".dia")) {
    const coincide = numero
      ? dia.dataset.numero === String(Number(numero[1]))
      : palabras.every((p) => dia.dataset.busqueda.includes(p));
    dia.hidden = !coincide;
    if (coincide) vistos++;
  }

  sinResultados.hidden = vistos > 0;
  pintarTexto(sinResultados, ["No hay nada con “", buscado, "”."]);
  resultadoBusqueda.textContent = !termino
    ? ""
    : vistos === 0
      ? "Sin resultados"
      : vistos === 1 ? "1 pregunta" : vistos + " preguntas";
  lista.scrollTop = 0;
}

campoBuscar.addEventListener("input", buscar);
// Enter no recarga la página; Escape borra la búsqueda
buscador.addEventListener("submit", (e) => e.preventDefault());
campoBuscar.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && campoBuscar.value) {
    campoBuscar.value = "";
    buscar();
  }
});

async function iniciar() {
  const sesion = await exigirSesion();
  if (!sesion) return;
  const miId = sesion.user.id;

  const hoy = numeroDePreguntaHoy();
  if (hoy < 1) {
    ponerAviso("El diario empieza el " + fechaDePregunta(1) + ".");
    return;
  }

  try {
    const [preguntas, respuestas, perfiles] = await Promise.all([
      traerTodo("preguntas", "numero, texto", "numero", (q) => q.lte("numero", hoy)),
      traerTodo("respuestas", "id, usuario_id, pregunta_numero, texto, animo", "id"),
      traerTodo("perfiles", "id, nombre", "nombre"),
    ]);

    if (preguntas.length === 0) {
      ponerAviso("Todavía no hay preguntas.");
      return;
    }

    dibujar(preguntas, respuestas, perfiles, miId);
    buscador.hidden = false;

    // El arcoíris: ya respondí la pregunta de hoy
    if (respuestas.some((r) => r.usuario_id === miId && r.pregunta_numero === hoy)) {
      mostrarArcoiris(false);
    }
  } catch (error) {
    console.error(error.message);
    ponerAviso("No se pudo cargar el historial. Recarga la página para intentarlo de nuevo.");
  }
}

iniciar();
