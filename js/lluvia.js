// Funciones compartidas por home.js e historial.js
// (se carga DESPUÉS de supabaseClient.js, porque usa la variable "db")

// Día en que empieza el diario: ese día toca la pregunta #1, al siguiente la #2, etc.
// Formato AAAA-MM-DD. Cámbialo por la fecha en que quieran empezar de verdad.
// IMPORTANTE: debe coincidir con la fecha de pregunta_de_hoy() en supabase/04_cierre_y_dia.sql
const FECHA_INICIO = "2026-10-09";

// La hora se toma de Ciudad de México para los dos,
// sin importar dónde esté cada quien.
const ZONA_HORARIA = "America/Mexico_City";

// Hora (de Ciudad de México) a la que sale la pregunta nueva.
// IMPORTANTE: debe coincidir con el "interval '7 hours'" de pregunta_de_hoy() en el SQL 04.
const HORA_NUEVA_PREGUNTA = 7;

// La fecha de hoy en ZONA_HORARIA, como Date a medianoche.
// Con horasDeRetraso = 7, el "día" empieza a las 7:00 en lugar de a las 0:00.
function hoyEnMexico(horasDeRetraso = 0) {
  const momento = new Date(Date.now() - horasDeRetraso * 3600000);
  // "en-CA" da el formato AAAA-MM-DD
  const texto = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(momento);
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

// Devuelve el número de la pregunta que toca hoy (0 o menos = el diario aún no empieza)
function numeroDePreguntaHoy() {
  const [anio, mes, dia] = FECHA_INICIO.split("-").map(Number);
  const inicio = new Date(anio, mes - 1, dia);
  const hoy = hoyEnMexico(HORA_NUEVA_PREGUNTA);
  const dias = Math.round((hoy - inicio) / 86400000); // 86400000 ms = 1 día
  return dias + 1;
}

// Fecha que le corresponde a la pregunta número n, en texto legible
function fechaDePregunta(n) {
  const [anio, mes, dia] = FECHA_INICIO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia + (n - 1));
  return fecha.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

// Borrador de la respuesta, guardado en este navegador para no perder lo escrito.
// localStorage puede fallar (modo privado, bloqueado...), por eso el try/catch:
// si falla, simplemente no hay borrador.
function claveBorrador(usuarioId, numero) {
  return "lluvia-borrador-" + usuarioId + "-" + numero;
}

function leerBorrador(clave) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function guardarBorrador(clave, texto) {
  try {
    localStorage.setItem(clave, texto);
  } catch {}
}

function borrarBorrador(clave) {
  try {
    localStorage.removeItem(clave);
  } catch {}
}
