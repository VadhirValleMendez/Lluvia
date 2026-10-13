// El jardín: por cada día que respondemos los dos, brota una flor.
// (se carga DESPUÉS de lluvia.js, porque usa traerTodo, leerLocal y guardarLocal)
//
// La flor de cada día es "aleatoria pero estable": se elige con un generador
// de números al azar cuya semilla es el número de la pregunta. Así los dos
// vemos el mismo jardín y no cambia al recargar, sin guardar nada en la base de datos.

const SVG_NS = "http://www.w3.org/2000/svg";

// Medidas del jardín (en píxeles)
const CIELO_JARDIN = 116;   // espacio sobre la primera fila, para las cabezas de las flores
const ANCHO_COLUMNA = 58;   // espacio horizontal de cada flor: que respiren
const SEPARACION_MIN = 50;  // separación mínima entre filas

// Generador de números al azar con semilla (mulberry32).
// Devuelve una función que da un número entre 0 y 1 cada vez que se llama.
function azar(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function elegir(lista, aleatorio) {
  return lista[Math.floor(aleatorio() * lista.length)];
}

function entre(min, max, aleatorio) {
  return min + (max - min) * aleatorio();
}

// Crea un elemento SVG con sus atributos y lo mete en "padre"
function forma(padre, etiqueta, atributos) {
  const el = document.createElementNS(SVG_NS, etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) el.setAttribute(nombre, valor);
  padre.appendChild(el);
  return el;
}

// ---------- Las cabezas de las flores ----------
// Cada función dibuja la flor con centro en (x, y). El dibujo mide 40 x 120.

function dibujarMargarita(g, x, y) {
  for (let i = 0; i < 12; i++) {
    forma(g, "ellipse", {
      class: "petalo", cx: x, cy: y - 8, rx: 3.2, ry: 7,
      transform: `rotate(${i * 30} ${x} ${y})`,
    });
  }
  forma(g, "circle", { class: "centro", cx: x, cy: y, r: 4.5 });
}

function dibujarTulipan(g, x, y) {
  forma(g, "path", {
    class: "petalo",
    d: `M${x - 10} ${y - 7} Q${x - 11} ${y + 11} ${x} ${y + 11} Q${x + 11} ${y + 11} ${x + 10} ${y - 7}
        L${x + 5} ${y - 2} L${x} ${y - 11} L${x - 5} ${y - 2} Z`,
  });
  forma(g, "path", { class: "detalle", d: `M${x} ${y - 4} L${x} ${y + 8}` });
}

function dibujarGirasol(g, x, y) {
  for (let i = 0; i < 16; i++) {
    forma(g, "ellipse", {
      class: "petalo", cx: x, cy: y - 10, rx: 3, ry: 6.5,
      transform: `rotate(${i * 22.5} ${x} ${y})`,
    });
  }
  forma(g, "circle", { class: "centro--oscuro", cx: x, cy: y, r: 7 });
}

function dibujarRosa(g, x, y) {
  forma(g, "circle", { class: "petalo", cx: x, cy: y, r: 11 });
  forma(g, "path", { class: "detalle", d: `M${x - 7} ${y + 1} a7 7 0 1 1 7 7` });
  forma(g, "path", { class: "detalle", d: `M${x - 3} ${y} a3.5 3.5 0 1 1 3.5 3.5` });
}

function dibujarLavanda(g, x, y) {
  for (let i = 0; i < 8; i++) {
    forma(g, "ellipse", {
      class: "petalo", cx: x + (i % 2 ? 2.6 : -2.6), cy: y - 15 + i * 4.4, rx: 2.8, ry: 3.6,
    });
  }
  forma(g, "ellipse", { class: "petalo", cx: x, cy: y - 18, rx: 2.4, ry: 3.2 });
}

function dibujarAmapola(g, x, y) {
  for (let i = 0; i < 5; i++) {
    const angulo = (i * 72 * Math.PI) / 180;
    forma(g, "circle", {
      class: "petalo", cx: x + Math.sin(angulo) * 6, cy: y - Math.cos(angulo) * 6, r: 7.5,
    });
  }
  forma(g, "circle", { class: "centro--oscuro", cx: x, cy: y, r: 3.5 });
}

// Pétalos con forma de gota: la seña de identidad de Lluvia
function dibujarFlorGota(g, x, y) {
  for (let i = 0; i < 5; i++) {
    forma(g, "path", {
      class: "petalo",
      d: `M${x} ${y} C${x - 3} ${y - 4} ${x - 6} ${y - 8} ${x - 6} ${y - 11}
          A6 6 0 0 1 ${x + 6} ${y - 11} C${x + 6} ${y - 8} ${x + 3} ${y - 4} ${x} ${y} Z`,
      transform: `rotate(${i * 72} ${x} ${y})`,
    });
  }
  forma(g, "circle", { class: "centro", cx: x, cy: y, r: 2.8 });
}

const TIPOS_DE_FLOR = [
  { nombre: "margarita", colores: ["blanca", "rosa"], dibujar: dibujarMargarita },
  { nombre: "tulipan", colores: ["roja", "rosa", "amarilla", "naranja"], dibujar: dibujarTulipan },
  { nombre: "girasol", colores: ["amarilla"], dibujar: dibujarGirasol },
  { nombre: "rosa", colores: ["roja", "rosa"], dibujar: dibujarRosa },
  { nombre: "lavanda", colores: ["lavanda"], dibujar: dibujarLavanda },
  { nombre: "amapola", colores: ["roja", "naranja"], dibujar: dibujarAmapola },
  { nombre: "gota", colores: ["celeste", "lila"], dibujar: dibujarFlorGota },
];

// El brote: un capullo cerrado (forma de gota) en un cáliz verde. Asoma el
// color de la flor que será, y está a la misma altura, para que al florecer
// la flor salga del mismo sitio.
function dibujarBrote(g, x, y) {
  forma(g, "path", {
    class: "petalo",
    d: `M${x} ${y - 12} C${x + 6} ${y - 4} ${x + 5} ${y + 4} ${x} ${y + 6} C${x - 5} ${y + 4} ${x - 6} ${y - 4} ${x} ${y - 12} Z`,
  });
  forma(g, "path", { class: "caliz", d: `M${x} ${y + 7} q-8 -1 -8 -10 q5 3 8 10 Z` });
  forma(g, "path", { class: "caliz", d: `M${x} ${y + 7} q8 -1 8 -10 q-5 3 -8 10 Z` });
}

// La flor del día "numero": siempre la misma para ese día
function crearFlor(numero) {
  return crearPlanta(numero, false);
}

// El brote del día "numero": mi respuesta, esperando la de la pareja
function crearBrote(numero) {
  return crearPlanta(numero, true);
}

function crearPlanta(numero, esBrote) {
  const aleatorio = azar(numero * 2654435761);
  const tipo = elegir(TIPOS_DE_FLOR, aleatorio);
  const color = elegir(tipo.colores, aleatorio);
  const alto = entre(66, 96, aleatorio);     // largo del tallo
  const curva = entre(-6, 6, aleatorio);     // qué tanto se dobla el tallo
  const hojaALaDerecha = aleatorio() < 0.5;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 40 120");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("class", `flor flor--${esBrote ? "brote" : tipo.nombre} petalo--${color}`);

  // Inclinación y vaivén propios de cada flor, para que no se muevan todas igual
  svg.style.setProperty("--giro", entre(-6, 6, aleatorio).toFixed(1) + "deg");
  svg.style.setProperty("--mecer", entre(4.5, 7, aleatorio).toFixed(1) + "s");
  svg.style.setProperty("--retraso", (-entre(0, 6, aleatorio)).toFixed(1) + "s");

  const cabezaY = 120 - alto;
  const hojaY = 120 - alto * 0.38;
  // Dónde empieza la cabeza (0 = arriba del dibujo), para colocar la etiqueta encima
  svg.dataset.cabeza = ((cabezaY - 18) / 120).toFixed(3);
  forma(svg, "path", {
    class: "hoja",
    d: `M20 ${hojaY} q9 -9 15 -3 q-7 8 -15 3 Z`,
    transform: hojaALaDerecha ? "" : "translate(40 0) scale(-1 1)",
  });

  // El tallo va encima de la hoja
  forma(svg, "path", {
    class: "tallo",
    d: `M20 120 Q${20 + curva} ${(120 + cabezaY) / 2} 20 ${cabezaY}`,
  });

  if (esBrote) dibujarBrote(svg, 20, cabezaY);
  else tipo.dibujar(svg, 20, cabezaY);
  return svg;
}

// ---------- Qué días tienen flor ----------

// Qué hay en el jardín, de menor a mayor número de pregunta:
//   flores: preguntas que respondimos los dos, cada uno el mismo día de la pregunta
//   brotes: preguntas que respondí yo a tiempo y la pareja no (aún, o tarde).
//           Pasado su día, el brote se queda así para siempre.
// Solo cuentan las respuestas escritas el día de su pregunta (creada_en no
// cambia al editar): responder una pregunta anterior no hace nacer nada.
// Por las reglas RLS solo llega la respuesta de la pareja si yo ya respondí;
// si respondió solo la pareja, no lo puedo saber: no hay brote hasta que yo responda.
//   respondiHoy: si ya respondí la pregunta de hoy (para el arcoíris)
async function estadoDelJardin(miId) {
  const respuestas = await traerTodo("respuestas", "usuario_id, pregunta_numero, creada_en", "id");
  const hoy = numeroDePreguntaHoy();
  const aTiempo = {};
  let respondiHoy = false;
  for (const r of respuestas) {
    if (r.usuario_id === miId && r.pregunta_numero === hoy) respondiHoy = true;
    if (numeroDePreguntaEn(r.creada_en) !== r.pregunta_numero) continue; // llegó tarde
    if (!aTiempo[r.pregunta_numero]) aTiempo[r.pregunta_numero] = new Set();
    aTiempo[r.pregunta_numero].add(r.usuario_id);
  }
  const flores = [];
  const brotes = [];
  for (const n of Object.keys(aTiempo).map(Number).sort((a, b) => a - b)) {
    if (aTiempo[n].size >= 2) flores.push(n);
    else if (aTiempo[n].has(miId)) brotes.push(n);
  }
  return { flores, brotes, respondiHoy };
}

// Texto para contar el jardín: "29 flores y 1 brote"
function contarJardin(flores, brotes) {
  const partes = [flores === 1 ? "1 flor" : flores + " flores"];
  if (brotes) partes.push(brotes === 1 ? "1 brote" : brotes + " brotes");
  return partes.join(" y ");
}

// Para probar cómo se ve un jardín grande: añade ?flores=100 a la dirección
// (home.html?flores=100 o jardin.html?flores=100). Son flores de mentira:
// solo se pintan en esta pantalla; no se guarda nada ni se toca la base de datos.
function floresDePrueba() {
  const cantidad = Math.floor(Number(new URLSearchParams(window.location.search).get("flores")));
  if (!(cantidad > 0)) return null;
  return Array.from({ length: Math.min(cantidad, 1000) }, (_, i) => i + 1);
}

// Las flores que esta persona todavía no había visto (para que broten con animación).
// Se recuerda en este navegador qué flores ya vio.
function floresNuevas(usuarioId, numeros) {
  const clave = "lluvia-flores-" + usuarioId;
  let vistas = [];
  try {
    vistas = JSON.parse(leerLocal(clave)) || [];
  } catch {}
  guardarLocal(clave, JSON.stringify(numeros));

  const yaVistas = new Set(vistas);
  return new Set(numeros.filter((n) => !yaVistas.has(n)));
}

// ---------- Plantar el jardín ----------

// Lo último que se plantó en cada jardín, para volver a plantarlo
// (sin animación) si cambia el tamaño de la pantalla.
const jardinesPlantados = new WeakMap();

// Planta las flores de "numeros" en "contenedor". Las flores tienen un tamaño
// cómodo fijo: se llenan las filas que caben a lo alto del prado y, si no caben
// a lo ancho, el jardín sigue hacia la derecha (el prado se desplaza en horizontal).
// Las más antiguas a la izquierda; al abrir se ven las más recientes.
//   nuevas:  Set de números que brotan con animación
//   enlaces: true para que cada flor lleve a su pregunta
//   escala:  tamaño de las flores (1 = normal)
//   fijo:    true para un prado tranquilo, sin desplazarse: solo las últimas
//            flores que caben en una fila, bien separadas (lo usa Hoy)
//   brotes:  Set de números que se dibujan como brote (mi respuesta esperando)
//   nombrePareja: para la etiqueta de los brotes
function plantarJardin(contenedor, numeros, { nuevas = new Set(), enlaces = false, escala = 1, fijo = false, brotes = new Set(), nombrePareja = "tu pareja" } = {}) {
  const primeraVez = !jardinesPlantados.has(contenedor);
  const opciones = { enlaces, escala, fijo, brotes, nombrePareja };
  jardinesPlantados.set(contenedor, { numeros, opciones });
  dibujarJardin(contenedor, numeros, opciones, nuevas);
  contenedor.scrollLeft = contenedor.scrollWidth; // las más recientes a la vista

  if (!primeraVez) return;

  if (enlaces) prepararEtiqueta(contenedor);

  if (!fijo) {

    // Con la rueda del ratón (vertical) también se recorre el prado
    contenedor.addEventListener("wheel", (e) => {
      if (contenedor.scrollWidth <= contenedor.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      contenedor.scrollLeft += e.deltaY;
      e.preventDefault();
    }, { passive: false });
  }

  if ("ResizeObserver" in window) {
    let ancho = contenedor.clientWidth;
    let alto = contenedor.clientHeight;
    new ResizeObserver(() => {
      if (contenedor.clientWidth === ancho && contenedor.clientHeight === alto) return;
      ancho = contenedor.clientWidth;
      alto = contenedor.clientHeight;
      const ultimo = jardinesPlantados.get(contenedor);
      dibujarJardin(contenedor, ultimo.numeros, ultimo.opciones, new Set());
    }).observe(contenedor);
  }
}

const ANCHO_COLUMNA_FIJO = 84; // en el prado fijo de Hoy, las flores van más separadas

function dibujarJardin(contenedor, todas, { enlaces, escala, fijo, brotes, nombrePareja }, nuevas) {
  const lienzo = document.createElement("div");
  lienzo.className = "jardin__lienzo";
  contenedor.replaceChildren(lienzo);
  contenedor.style.setProperty("--escala", escala);
  if (todas.length === 0) return;

  const visible = contenedor.clientWidth || 320;
  const cielo = CIELO_JARDIN * escala + (enlaces ? 30 : 0); // sitio para la etiqueta al pasar
  const alto = (contenedor.clientHeight || 220) - 14;       // un poco de pasto por debajo
  const columna = (fijo ? ANCHO_COLUMNA_FIJO : ANCHO_COLUMNA) * escala;

  // Prado fijo: solo las últimas flores que caben en una fila
  const numeros = fijo ? todas.slice(-Math.max(1, Math.floor(visible / columna))) : todas;
  const n = numeros.length;

  // Cuántas filas caben a lo alto; si pocas flores caben a lo ancho, se usan menos filas
  const filasMax = fijo ? 1 : Math.max(1, Math.floor((alto - cielo) / (SEPARACION_MIN * escala)) + 1);
  const columnasVisibles = Math.max(1, Math.floor(visible / columna));
  const filas = Math.min(filasMax, Math.max(1, Math.ceil(n / columnasVisibles)));
  const columnas = Math.ceil(n / filas);

  // Si caben en la pantalla, se reparten a lo ancho; si no, el lienzo se alarga
  const caben = columnas * columna <= visible;
  const paso = caben ? Math.min(visible / columnas, columna * 2) : columna;
  const ancho = caben ? visible : columnas * paso + columna;
  const margen = (ancho - columnas * paso) / 2;
  lienzo.style.width = ancho + "px";

  // Las filas se reparten por el alto del prado
  const separacion = filas > 1 ? Math.min((alto - cielo) / (filas - 1), 80 * escala) : 0;
  const inicio = cielo + Math.max(0, alto - cielo - (filas - 1) * separacion) * 0.5;

  let orden = [];

  numeros.forEach((numero, i) => {
    const col = Math.floor(i / filas);
    const enLaColumna = i % filas;

    // Dentro de cada columna, las filas se barajan (siempre igual) para que no parezca una cuadrícula
    if (enLaColumna === 0) {
      const barajar = azar(col * 7919 + filas);
      orden = [...Array(filas).keys()].sort(() => barajar() - 0.5);
    }
    const fila = orden[enLaColumna];

    const aleatorio = azar(numero * 40503 + 17);
    const desfase = fila % 2 ? 0.25 : -0.25; // filas alternas, como al tresbolillo
    const x = margen + (col + 0.5 + desfase + (aleatorio() - 0.5) * 0.35) * paso;
    const y = inicio + fila * separacion + (aleatorio() - 0.5) * 10 * escala;

    let planta;
    if (enlaces) {
      planta = document.createElement("a");
      planta.href = "home.html?pregunta=" + numero;
      const dia = numero + ", del " + fechaDePregunta(numero);
      if (brotes.has(numero)) {
        const espera = "esperando la respuesta de " + nombrePareja;
        planta.dataset.etiqueta = "Pregunta " + dia + ": " + espera;
        planta.setAttribute("aria-label", "Brote de la pregunta " + dia + ", " + espera);
      } else {
        planta.dataset.etiqueta = "Pregunta " + dia;
        planta.setAttribute("aria-label", "Flor de la pregunta " + dia);
      }
    } else {
      planta = document.createElement("span");
    }

    planta.className = "planta";
    planta.style.left = Math.max(columna * 0.4, Math.min(ancho - columna * 0.4, x)) + "px";
    planta.style.top = y + "px";
    planta.style.zIndex = fila + 1;

    // Las nuevas brotan empezando por las más recientes, que son las que se ven primero
    if (nuevas.has(numero)) {
      planta.classList.add("planta--nueva");
      planta.style.setProperty("--brote", Math.min((n - 1 - i) * 0.04, 2.5) + "s");
    }

    planta.appendChild(brotes.has(numero) ? crearBrote(numero) : crearFlor(numero));
    lienzo.appendChild(planta);
  });
}

// ---------- Etiqueta de la flor ----------
// Una sola etiqueta flotante, fuera del prado (que recorta lo que sobresale),
// que dice de qué pregunta es la flor al pasar el cursor o enfocarla.

let etiquetaFlor = null;

function prepararEtiqueta(contenedor) {
  if (!etiquetaFlor) {
    etiquetaFlor = document.createElement("div");
    etiquetaFlor.className = "etiqueta-flor";
    etiquetaFlor.setAttribute("aria-hidden", "true"); // el texto ya está en el aria-label de la flor
    etiquetaFlor.hidden = true;
    document.body.appendChild(etiquetaFlor);
  }

  const plantaDe = (e) => e.target.closest && e.target.closest("a.planta");
  contenedor.addEventListener("pointerover", (e) => {
    const planta = plantaDe(e);
    if (planta) mostrarEtiqueta(planta);
  });
  contenedor.addEventListener("pointerout", (e) => {
    const planta = plantaDe(e);
    if (planta && !planta.contains(e.relatedTarget)) ocultarEtiqueta();
  });
  contenedor.addEventListener("focusin", (e) => {
    const planta = plantaDe(e);
    if (planta) mostrarEtiqueta(planta);
  });
  contenedor.addEventListener("focusout", ocultarEtiqueta);
  contenedor.addEventListener("scroll", ocultarEtiqueta, { passive: true });
}

function mostrarEtiqueta(planta) {
  const svg = planta.querySelector("svg");
  if (!svg) return;
  etiquetaFlor.textContent = planta.dataset.etiqueta;
  etiquetaFlor.hidden = false;

  const r = svg.getBoundingClientRect();
  const cabeza = r.top + r.height * Number(svg.dataset.cabeza || 0);
  const ancho = etiquetaFlor.offsetWidth;
  const alto = etiquetaFlor.offsetHeight;
  const margen = 8;

  // Encima de la cabeza de la flor; si no cabe arriba, debajo
  let arriba = cabeza - alto - 6;
  if (arriba < margen) arriba = cabeza + r.height * 0.3;
  let izquierda = r.left + r.width / 2 - ancho / 2;
  izquierda = Math.max(margen, Math.min(window.innerWidth - ancho - margen, izquierda));

  etiquetaFlor.style.top = Math.round(arriba) + "px";
  etiquetaFlor.style.left = Math.round(izquierda) + "px";
}

function ocultarEtiqueta() {
  if (etiquetaFlor) etiquetaFlor.hidden = true;
}
