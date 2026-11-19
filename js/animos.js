// El ánimo del día: cómo se sintió cada quien. Antes de guardar una respuesta
// nueva se elige uno (js/home.js) y se ve en el Historial (js/historial.js).
// Cada ánimo es una gota (la seña de identidad de Lluvia) con una carita,
// dibujada aquí en SVG; los colores pastel vienen del CSS (.animo--feliz…).
//
// Los nombres son sustantivos ("Calma", no "tranquilo/a") para no suponer
// el género de nadie. La clave es lo que se guarda en la base de datos
// (columna respuestas.animo, ver supabase/animos.sql).

const ANIMOS = [
  { clave: "feliz", nombre: "Alegría" },
  { clave: "enamorado", nombre: "Amor" },
  { clave: "tranquilo", nombre: "Calma" },
  { clave: "triste", nombre: "Tristeza" },
  { clave: "enojado", nombre: "Enojo" },
];

const SVG_ANIMO = "http://www.w3.org/2000/svg";

function nombreAnimo(clave) {
  const animo = ANIMOS.find((a) => a.clave === clave);
  return animo ? animo.nombre : "";
}

function trazoAnimo(svg, etiqueta, atributos) {
  const el = document.createElementNS(SVG_ANIMO, etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) el.setAttribute(nombre, valor);
  svg.appendChild(el);
  return el;
}

// Un corazoncito con la punta en (x, y + 2)
function corazon(x, y) {
  return `M${x} ${y + 2.6} L${x - 2.7} ${y - 0.1} A1.6 1.6 0 0 1 ${x} ${y - 2.2} A1.6 1.6 0 0 1 ${x + 2.7} ${y - 0.1} Z`;
}

// Las caritas. La gota mide 40 x 44 y su parte redonda tiene el centro en (20, 27).
const CARAS = {
  feliz(svg) {
    trazoAnimo(svg, "circle", { class: "mejilla", cx: 11.5, cy: 31, r: 2.4 });
    trazoAnimo(svg, "circle", { class: "mejilla", cx: 28.5, cy: 31, r: 2.4 });
    trazoAnimo(svg, "path", { class: "trazo", d: "M13 27.5 q2.5 -3.2 5 0 M22 27.5 q2.5 -3.2 5 0" });
    trazoAnimo(svg, "path", { class: "trazo", d: "M14.5 31.5 q5.5 5.5 11 0" });
  },
  enamorado(svg) {
    trazoAnimo(svg, "circle", { class: "mejilla", cx: 11.5, cy: 31.5, r: 2.4 });
    trazoAnimo(svg, "circle", { class: "mejilla", cx: 28.5, cy: 31.5, r: 2.4 });
    trazoAnimo(svg, "path", { class: "corazon", d: corazon(15.5, 26.5) });
    trazoAnimo(svg, "path", { class: "corazon", d: corazon(24.5, 26.5) });
    trazoAnimo(svg, "path", { class: "trazo", d: "M15.5 32 q4.5 4 9 0" });
  },
  tranquilo(svg) {
    trazoAnimo(svg, "path", { class: "trazo", d: "M13 27 q2.5 2.6 5 0 M22 27 q2.5 2.6 5 0" });
    trazoAnimo(svg, "path", { class: "trazo", d: "M16.5 32.5 q3.5 2.2 7 0" });
  },
  triste(svg) {
    trazoAnimo(svg, "path", { class: "trazo", d: "M12.5 24.5 l4 -1.2 M27.5 24.5 l-4 -1.2" });
    trazoAnimo(svg, "circle", { class: "punto", cx: 15.5, cy: 27.5, r: 1.7 });
    trazoAnimo(svg, "circle", { class: "punto", cx: 24.5, cy: 27.5, r: 1.7 });
    trazoAnimo(svg, "path", { class: "trazo", d: "M16 34.5 q4 -3.6 8 0" });
    // Una lagrimita, también en forma de gota
    trazoAnimo(svg, "path", { class: "lagrima", d: "M12.5 29.5 c-1.3 1.8 -2 2.9 -2 3.8 a2 2 0 0 0 4 0 c0 -0.9 -0.7 -2 -2 -3.8 Z" });
  },
  enojado(svg) {
    trazoAnimo(svg, "path", { class: "trazo", d: "M12.5 23.5 l5 2.2 M27.5 23.5 l-5 2.2" });
    trazoAnimo(svg, "circle", { class: "punto", cx: 15.5, cy: 28, r: 1.7 });
    trazoAnimo(svg, "circle", { class: "punto", cx: 24.5, cy: 28, r: 1.7 });
    trazoAnimo(svg, "path", { class: "trazo", d: "M16 34 q4 -2.4 8 0" });
  },
};

// La gota con la carita del ánimo "clave".
//   etiqueta: si se da, el lector de pantalla la lee (role="img");
//             si no, el dibujo es decorativo (el texto está en otro sitio).
function crearCaraAnimo(clave, { etiqueta = "" } = {}) {
  const svg = document.createElementNS(SVG_ANIMO, "svg");
  svg.setAttribute("viewBox", "0 0 40 44");
  svg.setAttribute("class", "animo animo--" + clave);
  svg.setAttribute("focusable", "false");
  if (etiqueta) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", etiqueta);
  } else {
    svg.setAttribute("aria-hidden", "true");
  }

  trazoAnimo(svg, "path", {
    class: "animo__gota",
    d: "M20 2.5 C17 7 5 18.5 5 27 a15 15 0 0 0 30 0 C35 18.5 23 7 20 2.5 Z",
  });
  if (CARAS[clave]) CARAS[clave](svg);
  return svg;
}
