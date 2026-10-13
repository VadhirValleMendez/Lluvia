// Bienvenida: la primera vez que se abre Lluvia en este teléfono u ordenador,
// sobre el paisaje aparecen tres frases y brota una flor en el prado (~7 s).
// Se puede saltar con el botón "Saltar" o con Escape. Después ya no vuelve a salir.
// (El <head> de index.html pone la clase "con-intro" si aún no se ha visto,
// para que el formulario no parpadee antes de empezar.)
// Las fases se marcan con clases en <html>, como la lluvia (js/tormenta.js).

const CLAVE_INTRO = "lluvia-intro-vista";

(function bienvenida() {
  const raiz = document.documentElement;
  if (!raiz.classList.contains("con-intro")) return;

  const intro = document.getElementById("intro");
  const btnSaltar = document.getElementById("btn-saltar");
  const FASES = ["intro-a", "intro-b", "intro-c", "intro-d"];

  // La flor que brota en el centro del prado
  const flor = document.createElement("span");
  flor.className = "intro__flor";
  const planta = document.createElement("span");
  planta.className = "planta";
  planta.appendChild(crearFlor(7));
  flor.appendChild(planta);
  document.querySelector(".prado__suelo").appendChild(flor);

  intro.hidden = false;

  function fase(clase) {
    raiz.classList.remove(...FASES);
    raiz.classList.add(clase);
  }

  const relojes = [
    setTimeout(() => fase("intro-a"), 600),  // "Una pregunta al día"
    setTimeout(() => fase("intro-b"), 2600), // "para conocernos mejor"
    setTimeout(() => fase("intro-c"), 4400), // brota la flor: "y una flor por cada día…"
    setTimeout(() => fase("intro-d"), 6400), // todo se desvanece
    setTimeout(terminar, 7200),
  ];

  function terminar() {
    relojes.forEach(clearTimeout);
    try {
      localStorage.setItem(CLAVE_INTRO, "1");
    } catch {}
    raiz.classList.remove("con-intro", ...FASES);
    intro.hidden = true;
    flor.remove();
    document.removeEventListener("keydown", alTeclear);
  }

  function alTeclear(e) {
    if (e.key === "Escape") terminar();
  }

  btnSaltar.addEventListener("click", terminar);
  document.addEventListener("keydown", alTeclear);
})();
