// La lluvia que riega el jardín: cada vez que guardas tu respuesta se nubla
// (cambia el clima: el cielo se oscurece, el pasto se moja, las montañas se
// pierden en la neblina), el sol se esconde detrás de la nube de la pregunta,
// llueve sobre el prado, se despeja, vuelve a salir el sol y aparece el
// arcoíris (que se queda todo el día: "ya respondí hoy").
// Dura unos 6 segundos y no se puede saltar: mientras tanto #contenido queda "inert".
// Las fases se marcan con clases en <html> y el CSS hace el resto.
// El arcoíris está en js/arcoiris.js (se carga antes).

const tormenta = document.getElementById("tormenta");
const gotasDeLluvia = tormenta.querySelector(".tormenta__gotas");
const avisoLluvia = document.getElementById("aviso-lluvia");

const CANTIDAD_DE_GOTAS = 90;
const CANTIDAD_DE_SALPICADURAS = 18;
const colorDeBarra = document.querySelector('meta[name="theme-color"]');
const colorDeBarraNormal = colorDeBarra ? colorDeBarra.content : "";
let lloviendoAhora = false;

function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

// true mientras dura la animación (para no mostrar el arcoíris antes de tiempo)
function tormentaEnCurso() {
  return lloviendoAhora;
}

// Gotas alargadas que caen desde lo alto del cielo (un poco más a la
// derecha, porque el viento las inclina hacia la izquierda al caer), y
// salpicaduras en el prado, abajo
function sembrarGotas() {
  gotasDeLluvia.replaceChildren();
  for (let i = 0; i < CANTIDAD_DE_GOTAS; i++) {
    const gota = document.createElement("span");
    gota.className = "gota-lluvia";
    gota.style.left = (Math.random() * 125).toFixed(1) + "%";
    gota.style.top = (-8 + Math.random() * 14).toFixed(1) + "%";
    gota.style.animationDuration = (0.55 + Math.random() * 0.35).toFixed(2) + "s";
    gota.style.animationDelay = (-Math.random()).toFixed(2) + "s";
    gotasDeLluvia.appendChild(gota);
  }
  for (let i = 0; i < CANTIDAD_DE_SALPICADURAS; i++) {
    const onda = document.createElement("span");
    onda.className = "salpicadura";
    onda.style.left = (4 + Math.random() * 92).toFixed(1) + "%";
    onda.style.top = (78 + Math.random() * 19).toFixed(1) + "%";
    onda.style.animationDelay = (-Math.random() * 0.9).toFixed(2) + "s";
    gotasDeLluvia.appendChild(onda);
  }
}

// La barra del navegador del móvil también se nubla
function nublarBarra(nublada) {
  if (!colorDeBarra) return;
  const gris = getComputedStyle(document.documentElement).getPropertyValue("--tormenta-cielo-arriba").trim();
  colorDeBarra.content = nublada && gris ? gris : colorDeBarraNormal;
}

// conArcoiris: true si la respuesta guardada es la de hoy
async function llover({ conArcoiris = true } = {}) {
  const raiz = document.documentElement;
  const contenido = document.getElementById("contenido");
  const tranquilo = matchMedia("(prefers-reduced-motion: reduce)").matches;

  lloviendoAhora = true;
  contenido.inert = true;
  avisoLluvia.textContent = "Lloviendo sobre el jardín…";
  ocultarArcoiris();
  nublarBarra(true);

  if (tranquilo) {
    // Sin movimiento: solo se nubla y se despeja
    raiz.classList.add("nublando");
    await esperar(900);
    raiz.classList.replace("nublando", "despejando");
    nublarBarra(false);
    if (conArcoiris) mostrarArcoiris(false);
    await esperar(1300);
  } else {
    sembrarGotas();
    raiz.classList.add("nublando");    // 0 s: se nubla y el sol se esconde tras la nube
    await esperar(1200);
    raiz.classList.replace("nublando", "lloviendo");   // 1.2 s: llueve sobre el prado
    await esperar(3300);
    raiz.classList.replace("lloviendo", "despejando"); // 4.5 s: se despeja
    nublarBarra(false);
    await esperar(300);
    if (conArcoiris) mostrarArcoiris(true);           // 4.8 s: se dibuja el arcoíris
    await esperar(1200);
  }

  // Al quitar las fases, el sol volvería a su animación de entrada: se evita
  raiz.classList.replace("despejando", "tras-lluvia");
  gotasDeLluvia.replaceChildren();
  contenido.inert = false;
  lloviendoAhora = false;
  avisoLluvia.textContent = conArcoiris ? "Salió el arcoíris: ya respondiste hoy." : "";
}
