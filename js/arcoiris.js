// El arcoíris: "ya respondí hoy". Sale después de la lluvia (js/tormenta.js) y
// se queda todo el día en Hoy, Jardín e Historial.
// Dónde se coloca lo dice el atributo data-lugar del <svg id="arcoiris">:
//   sobre-nube:     su cima asoma entre el texto de la cabecera y la nube del
//                   contenido (Hoy: la pregunta; Historial: la lista)
//   sobre-montanas: las patas se apoyan en el prado y el arco pasa por detrás
//                   del título (Jardín)

const arcoiris = document.getElementById("arcoiris");

// En el dibujo (viewBox 0 0 1000 520) la cima del arco está en y = 50
const CIMA_DEL_ARCO = 50 / 520;

function colocarArcoiris() {
  const altoArco = arcoiris.getBoundingClientRect().height;
  let arriba;

  if (arcoiris.dataset.lugar === "sobre-montanas") {
    const prado = document.querySelector(".prado");
    if (!prado) return;
    arriba = prado.getBoundingClientRect().top + 24 - altoArco;
  } else {
    const nube = document.querySelector(".nube-pregunta, .hojas");
    const texto = document.querySelector(".cabecera__texto");
    if (!nube) return;
    const arribaNube = nube.getBoundingClientRect().top;
    // La cima va en el hueco entre la cabecera y la nube, sin tapar el texto
    const hueco = texto ? arribaNube - texto.getBoundingClientRect().bottom - 8 : 74;
    const asoma = Math.min(74, Math.max(30, hueco));
    arriba = arribaNube - asoma - altoArco * CIMA_DEL_ARCO;
  }

  arcoiris.style.setProperty("--arcoiris-top", Math.round(arriba) + "px");
}

// Ojo: el arcoíris es un <svg> y en SVG no existe la propiedad .hidden,
// por eso se pone y se quita el atributo.
function mostrarArcoiris(dibujar = false) {
  arcoiris.classList.remove("dibujando");
  arcoiris.removeAttribute("hidden");
  colocarArcoiris(); // ya visible, para poder medir su alto
  void arcoiris.getBoundingClientRect(); // reinicia la animación de dibujo
  arcoiris.classList.toggle("dibujando", dibujar);
}

function ocultarArcoiris() {
  arcoiris.setAttribute("hidden", "");
  arcoiris.classList.remove("dibujando");
}

addEventListener("resize", () => {
  if (!arcoiris.hasAttribute("hidden")) colocarArcoiris();
});
