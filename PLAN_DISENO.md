# Plan de diseño: "Un jardín bajo el cielo"

## Idea
Cada página es un **paisaje que se lee de arriba abajo**: arriba el cielo, donde **el sol cuenta los días juntos**; en medio, el contenido flota como nubes; y al final un **prado** donde brota una flor por cada día que respondemos los dos.

**Todo cabe en una pantalla, sin scroll.** Cada página mide `100svh`; lo largo se desplaza dentro de su caja. Lo memorable es una sola cosa: el sol grande, amarillo liso, con el número blanco. Todo lo demás es tranquilo y disciplinado.

Palabras guía: *calma, luz, cariño, crecer juntos*. Nada que parpadee; todo se mueve lento.

Se diseña **primero para el móvil** y después se adapta a pantallas grandes. No hay modo noche (`color-scheme: light`).

(Diseño anterior, "una tarde de lluvia tranquila": fondo blanco con verde agua `#21948A` y granate `#94212B`. Se reemplazó por este.)

## 1. Paleta (variables CSS en `:root`)

| Variable | Color | Uso | Contraste con blanco |
|---|---|---|---|
| `--cielo-arriba` | `#2A6FB5` | Cielo, parte de arriba | 5.2 |
| `--cielo-medio` | `#4A9AD8` | Cielo, centro | — |
| `--cielo-abajo` | `#9AD6F4` | Cielo, horizonte | — |
| `--cielo-50` / `-100` | `#EFF7FD` / `#DDEEFA` | Burbujas de respuesta, respuesta cerrada, nota de la pareja | — |
| `--cielo-200` | `#B9DCF4` | Bordes de campos | — |
| `--cielo-600` | `#1F5F9E` | Botones, enlaces, **lo mío** | 6.6 ✔ |
| `--cielo-700` | `#174A7C` | Hover de botones | 9.0 ✔ |
| `--texto` | `#13293F` | Texto dentro de las nubes | 14 ✔ |
| `--rosa-500` | `#B8336A` | **Lo de la pareja**, errores | 5.6 ✔ |
| `--rosa-300` / `-50` | `#E59BB9` / `#FBF0F4` | Bordes y fondos de lo de la pareja | — |
| `--sol` | `#FFD45C` | Sol, lo mío sobre el cielo, aro de foco sobre el cielo | — |
| `--pasto-claro` / `--pasto` / `--pasto-oscuro` | `#8ACB72` / `#5DB565` / `#3E8E48` | Colinas, suelo del jardín, tallos | — |
| `--flor-*` | varios | Pétalos (blanca, amarilla, naranja, roja, rosa, lila, lavanda, celeste) | — |

**Texto blanco sobre el cielo** (`--texto-cielo`, con `--sombra-texto`): solo títulos, el número de días, la navegación y frases de ≥ 19 px en negrita.

## 2. Tipografía
- **Young Serif** (serif de cuento ilustrado): títulos, preguntas y el número del sol. Un solo peso (400).
- **Atkinson Hyperlegible**: texto, botones y respuestas. Muy legible en el teléfono.
- Escala clásica: 14 (etiquetas) / 18 (texto) / 21 / 24 / 36 (pregunta y títulos) / 48 (sol).
- Nada de MAYÚSCULAS en etiquetas ni de "A · B": se escribe en frase normal ("Pregunta 4, del lunes 12 de octubre").

## 3. Estructura de cada página (una sola pantalla)
```
┌ cielo (fijo) ─────────────────────────┐
│  .-""-.       [Hoy | Jardín | Historial]│  ← menú arriba a la derecha
│ (  16  )               Hola, Vadhir    │  ← sol a la izquierda, texto a la derecha
│  '-..-'          Lunes 12 de octubre   │
│ ╭─╮╭──╮                                │
│ ┴─┴┴──┴──────────────────────────╮     │  ← los bultos de la nube tapan el sol
│ │ Pregunta 4                      │    │
│ │ ¿Qué canción te recuerda…?      │    │
│ │ (Tu respuesta) (La de Lore)     │    │  ← pestañas, las dos en azul
│ │ ___________________________     │    │
│ │              (Guardar respuesta)│    │
│ ╰─────────────────────────────────╯    │
│ ~~~~ colinas ~~~~~ ✿  ❀  ✿  ❀ ~~~~~~~~ │  ← prado: ~30 % del alto
│ Cerrar sesión                          │  ← abajo a la izquierda
└────────────────────────────────────────┘
```
- **Cielo** (`.cielo`, fijo): degradado y nubes que cruzan en 2–2.5 minutos, sin lluvia. En *Hoy* no lleva sol de fondo, porque el sol es el contador.
- **Prado** (`.prado`, `--alto-prado`): colinas SVG y pasto. En *Jardín* ocupa todo lo que deja la cabecera.
- **Solo el mismo día**: una respuesta solo cuenta para el jardín si se escribió el día de su pregunta (antes de las 7:00 del día siguiente).
- **Brote + flor**: si respondí y la pareja aún no, en el jardín hay un brote (capullo cerrado con el color de la flor que será, a la misma altura); cuando respondemos los dos, florece con la animación de brotar.
- **Etiqueta de la flor** (Jardín): flotante y fuera del prado (`.etiqueta-flor`, `position: fixed`), encima de la cabeza de la flor y siempre dentro de la pantalla; la flor se ilumina y crece un poco al pasar el cursor o enfocarla.
- **Jardín**: en *Hoy* el prado es fijo (`fijo: true`): solo las últimas flores que caben en una fila, bien separadas (≈6 en el móvil, ≈15 en escritorio), sin scroll. En *Jardín* están todas: se llenan las filas que caben a lo alto y, si no caben a lo ancho, **el prado se desplaza en horizontal** (también con la rueda del ratón), abriendo en las más recientes y con los bordes difuminados.
- **Barra de scroll** (prado de Jardín y lista del Historial): píldora blanca sobre un riel azul translúcido; amarilla al pasar el cursor. Firefox usa `scrollbar-color` (solo dentro de `@supports not selector(::-webkit-scrollbar)`, porque en Chrome anula el diseño).
- **Montañas lejanas** (`.prado__montanas`): dos cordilleras azuladas detrás de las colinas, en todas las páginas.
- **Historial**: todas las preguntas en una lista que se desplaza dentro de su zona (la página no se mueve); los bordes se difuminan para indicar que hay más. Las hojas se alternan un poco a izquierda y derecha.
- **Jardín**: el prado ocupa ~56 % del alto. Para probar un jardín grande: `jardin.html?flores=100` (flores de mentira, solo en pantalla).
- Pantallas bajas (`max-height` 700 / 600 px): el sol y el prado ceden alto; en el iPhone SE se oculta la fecha. Solo por debajo de 520 px de alto (móvil en horizontal) se permite el scroll.
- **Transiciones entre páginas** (View Transitions, `@view-transition { navigation: auto }`): el cielo y el menú se quedan quietos, el sol se desliza de un sitio a otro (`view-transition-name: sol`), el prado sube o baja y el contenido se funde en ~0.6 s. Las nubes no se reinician gracias a `--reloj`. Navegadores sin soporte cambian de página sin animación.
- Con `prefers-reduced-motion` todo queda quieto (también sin transiciones).

## La lluvia que riega el jardín (`js/tormenta.js`)
Cada vez que se guarda una respuesta (nueva o actualizada), todos los días. Dura ~6 s y no se puede saltar (`#contenido` queda `inert`). Vistas previas: `home.html?lluvia` (completa) y `home.html?arcoiris` (solo el arcoíris).

| Tiempo | Fase (clase en `<html>`) | Qué pasa |
|---|---|---|
| 0–1.2 s | `nublando` | Cambia el clima, no la pantalla: el cielo pasa a gris pizarra (capa `.cielo::before` con `--tormenta-cielo-*`), las nubes del fondo se vuelven grises, el pasto se ve mojado (`--tormenta-pasto*`), las montañas se pierden en la neblina y el sol baja y se esconde detrás de la nube de la pregunta (sin nubes extra; vuelve a salir al despejarse). La barra del navegador del móvil también se nubla. |
| 1.2–4.5 s | `lloviendo` | ~90 gotas alargadas caen inclinadas por el viento y dejan pequeñas ondas (salpicaduras) en el prado; las flores se mecen más rápido. |
| 4.5–6 s | `despejando` | Vuelve el cielo azul, el sol sale de detrás de la nube y el arcoíris se dibuja de izquierda a derecha. Al terminar queda `tras-lluvia` en `<html>` para que el sol no vuelva a "amanecer". |

- **Arcoíris** (`#arcoiris`, en `.cielo`, `js/arcoiris.js`): seis bandas pastel (`--arcoiris-1…6`). Se queda todo el día si ya respondí la pregunta de hoy:
  - *Hoy* e *Historial* (`data-lugar="sobre-nube"`): la cima asoma entre la cabecera y la nube del contenido.
  - *Jardín* (`data-lugar="sobre-montanas"`): un arco más estrecho con las patas en las montañas, enmarcando el título.
- Si con mi respuesta respondimos los dos, la flor nueva brota **después** de la lluvia.
- Con `prefers-reduced-motion`: el sol no se mueve y no hay gotas, solo un fundido a gris y de vuelta (~2 s).

## Bienvenida (`js/intro.js`)
La primera vez que se abre Lluvia en cada dispositivo (en el login), ~7 s, con botón "Saltar" (y Escape). El `<head>` pone `con-intro` en `<html>` si falta `lluvia-intro-vista` en `localStorage`, para que el formulario no parpadee.

| Tiempo | Fase | Qué pasa |
|---|---|---|
| 0.6 s | `intro-a` | "Una pregunta al día" |
| 2.6 s | `intro-b` | "para conocernos mejor" |
| 4.4 s | `intro-c` | Brota una flor en el centro del prado: "y una flor por cada día que respondemos los dos" |
| 6.4 s | `intro-d` | Todo se desvanece y aparece el login |

## 4. Componentes (cada uno con su jerarquía; no todo es la misma tarjeta)
- **Sol de los días** (`.sol--dias`): grande (hasta 190 px), amarillo liso `#FFD45C`, número **blanco** en Young Serif con una sombra dorada marcada (`--sombra-numero`). Ojo: blanco sobre amarillo da poco contraste; la sombra es lo que lo hace legible, y la cifra va también en `aria-label`. La frase completa ("16 días juntos") va en `aria-label`. Es el único momento animado al cargar: sale como un amanecer.
- **Nube de la pregunta** (`.nube-pregunta`): panel blanco, radio 32 px, con dos bultos que asoman por arriba. Sombra azul, nunca gris.
- **Renglones** (`textarea.renglones`): la respuesta se escribe sobre líneas de cuaderno.
- **Pestañas** (`.pestanas`): "Tu respuesta" y "La de Loredana", las dos en azul; junto al nombre de la pareja, una gota azul que "espera" mientras no responde. Si ya respondiste, se abre sola la de la pareja.
- **Navegación**: arriba a la derecha; píldoras sobre un velo azul opaco (se lee aunque pase una nube); la activa es blanca con texto azul. "Cerrar sesión" es un enlace discreto abajo a la izquierda, en el prado.
- **Botón principal**: píldora `--cielo-600`, texto blanco, onda al guardar.
- **Textos sobre el pasto** (jardín vacío, cargando): píldoras blancas.
- **Mensajes sueltos** (`.aviso`): en una nubecita blanca.
- **"Activar avisos"** (Hoy, junto a "Cerrar sesión"): pide permiso para las notificaciones; su mensaje aparece en una píldora blanca sobre el pasto.

## 5. El jardín (`js/flores.js`)
- **Una flor por día cerrado** (las dos respuestas guardadas). Se calcula en el navegador con las respuestas visibles: por RLS, si yo respondí también veo la de la pareja.
- **Aleatoria pero estable**: generador *mulberry32* con semilla = número de pregunta. Decide tipo, color, largo del tallo, curva, lado de la hoja, inclinación y ritmo del vaivén.
- **Siete tipos**: margarita, tulipán, girasol, rosa, lavanda, amapola y la **flor de gotas** (pétalos con forma de gota).
- Dibujo de 40 × 120 creado con `createElementNS`; colores por clase (`.petalo--rosa`, etc.).
- **Plantado en filas**: las más antiguas atrás y las nuevas al frente; huecos barajados con semilla para que no parezca una cuadrícula.
- **Movimiento**: cada flor se mece ±2.5° (4.5–7 s). Las que la persona aún no había visto **brotan** desde el suelo (se recuerdan en `localStorage`).
- **Dónde**: en *Hoy* con las últimas 12 creciendo en el prado; en `jardin.html`, todas, y cada flor lleva a su pregunta (`home.html?pregunta=N`) y muestra "Pregunta N, del …" al pasar o enfocar.

## 6. Accesibilidad y detalles
- Contraste AA: ver la tabla. Foco visible en azul dentro de las nubes y en amarillo sol sobre el cielo.
- Objetivos táctiles ≥ 44 px; margen lateral de 16 px; ancho máximo 640 px (760 en el historial).
- `theme-color` `#2A6FB5`; favicon: gota celeste `#4A9AD8`.

## Verificación
- Servir la web (`npx serve .` o `python -m http.server`) y revisar cada pantalla en el móvil (DevTools) y en escritorio.
- Estados: sin responder, respondida, cerrada (brota la flor), pareja pendiente, jardín vacío, error de login, historial vacío.
- Recargar y entrar con la otra cuenta: el jardín debe verse igual.
- `prefers-reduced-motion` desde DevTools → Rendering, y el sistema en modo oscuro (la web sigue en claro).
