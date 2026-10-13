// Funciones compartidas por home.js e historial.js
// (se carga DESPUÉS de supabaseClient.js, porque usa la variable "db")

// Día en que empieza el diario: ese día toca la pregunta #1, al siguiente la #2, etc.
// Formato AAAA-MM-DD. Cámbialo por la fecha en que quieran empezar de verdad.
// IMPORTANTE: debe coincidir con la fecha de pregunta_de_hoy() en supabase/cierre_y_dia.sql
const FECHA_INICIO = "2026-10-12";

// La hora se toma de Ciudad de México para los dos,
// sin importar dónde esté cada quien.
const ZONA_HORARIA = "America/Mexico_City";

// Hora (de Ciudad de México) a la que sale la pregunta nueva.
// IMPORTANTE: debe coincidir con el "interval '7 hours'" de pregunta_de_hoy() en supabase/cierre_y_dia.sql
const HORA_NUEVA_PREGUNTA = 7;

// La fecha de hoy (o de "instante") en ZONA_HORARIA, como Date a medianoche.
// Con horasDeRetraso = 7, el "día" empieza a las 7:00 en lugar de a las 0:00.
function hoyEnMexico(horasDeRetraso = 0, instante = Date.now()) {
  const momento = new Date(new Date(instante).getTime() - horasDeRetraso * 3600000);
  // "en-CA" da el formato AAAA-MM-DD
  const texto = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(momento);
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

// Número de la pregunta que tocaba en un momento dado (0 o menos = el diario aún no empezaba).
// Sirve para saber si una respuesta se escribió el mismo día de su pregunta.
function numeroDePreguntaEn(instante) {
  const [anio, mes, dia] = FECHA_INICIO.split("-").map(Number);
  const inicio = new Date(anio, mes - 1, dia);
  const ese = hoyEnMexico(HORA_NUEVA_PREGUNTA, instante);
  const dias = Math.round((ese - inicio) / 86400000); // 86400000 ms = 1 día
  return dias + 1;
}

// Número de la pregunta que toca hoy
function numeroDePreguntaHoy() {
  return numeroDePreguntaEn(Date.now());
}

// Una fecha en texto legible: "lunes 12 de octubre" (con el año si no es este)
function fechaLegible(fecha) {
  const texto = fecha
    .toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");
  const anio = fecha.getFullYear();
  return anio === hoyEnMexico().getFullYear() ? texto : texto + " de " + anio;
}

// Fecha que le corresponde a la pregunta número n, en texto legible
function fechaDePregunta(n) {
  const [anio, mes, dia] = FECHA_INICIO.split("-").map(Number);
  return fechaLegible(new Date(anio, mes - 1, dia + (n - 1)));
}

// Supabase entrega máximo 1000 filas por consulta. Esta función pide
// de 1000 en 1000 hasta traer todo, para que el historial no se corte
// cuando haya muchas respuestas.
async function traerTodo(tabla, columnas, orden, ajustar = (q) => q) {
  const todas = [];
  const paso = 1000;
  for (let desde = 0; ; desde += paso) {
    const consulta = ajustar(db.from(tabla).select(columnas).order(orden));
    const { data, error } = await consulta.range(desde, desde + paso - 1);
    if (error) throw error;
    todas.push(...data);
    if (data.length < paso) break;
  }
  return todas;
}

// Fecha desde la que cuentan su relación (AAAA-MM-DD)
const FECHA_RELACION = "2026-09-26";

// Días que llevan juntos. El mismo día de inicio es el día 0.
function diasJuntos() {
  const [anio, mes, dia] = FECHA_RELACION.split("-").map(Number);
  const inicio = new Date(anio, mes - 1, dia);
  return Math.round((hoyEnMexico() - inicio) / 86400000);
}

// Pinta un texto con partes remarcadas, por ejemplo:
//   pintarTexto(saludo, ["Hola, ", mio("Vadhir")])
// Cada parte se pone como texto (nunca como HTML), así que es seguro.
function pintarTexto(elemento, partes) {
  elemento.textContent = "";
  for (const parte of partes) {
    if (typeof parte === "string") {
      elemento.append(parte);
    } else {
      const span = document.createElement("span");
      span.className = parte.clase;
      span.textContent = parte.texto;
      elemento.append(span);
    }
  }
}

// Lo propio se remarca en azul y lo de la pareja en rosa
function mio(texto) {
  return { texto, clase: "mio" };
}

function dePareja(texto) {
  return { texto, clase: "de-pareja" };
}

// Cosas guardadas en este navegador: el borrador de la respuesta (para no
// perder lo escrito) y las flores que ya vimos (para que solo broten las nuevas).
// localStorage puede fallar (modo privado, bloqueado...), por eso el try/catch:
// si falla, simplemente no hay nada guardado.
function claveBorrador(usuarioId, numero) {
  return "lluvia-borrador-" + usuarioId + "-" + numero;
}

function leerLocal(clave) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function guardarLocal(clave, texto) {
  try {
    localStorage.setItem(clave, texto);
  } catch {}
}

function borrarLocal(clave) {
  try {
    localStorage.removeItem(clave);
  } catch {}
}
