# Plan de diseño: "PrimerDiseño"

## Idea
**Una tarde de lluvia tranquila.** Fondos claros con un verde agua muy suave, tarjetas blancas que flotan como papel, gotas de lluvia como único adorno y un toque granate (el complementario) solo en lo que tiene que ver con "nosotros": el corazón del contador y el nombre de la pareja.

Palabras guía: *calma, suave, cálido, íntimo*. Nada brillante, nada que parpadee.

Se diseña **primero para el móvil**, porque la pregunta se contesta desde el teléfono, y después se adapta a pantallas grandes.

## 1. Paleta (variables CSS en `:root`)
Tonos calculados a partir de los dos colores. El contraste está medido contra el blanco.

| Variable | Color | Uso | Contraste |
|---|---|---|---|
| `--agua-50` | `#F4FAF9` | Burbujas de respuestas ya escritas, respuesta cerrada | — |
| `--agua-100` | `#E4F2F1` | Borde finito de tarjetas | — |
| `--agua-200` | `#C1E1DE` | Bordes suaves, separadores | — |
| `--agua-300` | `#90CAC5` | Gotas decorativas | — |
| `--agua-400` | `#59AFA7` | Detalles e iconos grandes | — |
| `--agua-500` | `#21948A` | **Principal**: aro de foco, borde activo, número de pregunta | 3.7 (solo decorativo o texto grande) |
| `--agua-600` | `#1A766E` | Botones (texto blanco) y enlaces | 5.4 ✔ |
| `--agua-700` | `#145C56` | Botón en hover y títulos | 7.8 ✔ |
| `--agua-900` | `#0A2C29` | Texto principal (en vez de negro) | 14.9 ✔ |
| `--rubi-50` | `#F9F2F2` | Fondo del mensaje de error | — |
| `--rubi-300` | `#CA9095` | Corazón decorativo | — |
| `--rubi-500` | `#94212B` | **Complementario**: texto de error, nombre de la pareja, corazón | 8.4 ✔ |

**Proporción aproximada:** 85 % agua (incluidos el blanco y los fondos), 10 % texto oscuro, menos del 5 % rubí.

## 2. Tipografía (Google Fonts)
- **Títulos y preguntas:** *Fraunces*, una serif suave con curvas redondeadas, en peso 400–600. Da calidez y un aire de "diario".
- **Texto, botones y respuestas:** *Nunito*, una sans redondeada y amable, muy legible en el móvil.
- Tamaños:
  - texto: 17 px
  - pregunta del día: entre 24 y 28 px, con `clamp()`
  - interlineado: 1.6 en las respuestas, para que se lean como una carta

## 3. Componentes
- **Tarjeta** (`.tarjeta`): fondo blanco, `border-radius: 24px`, sombra muy difusa con tinte verde (`0 8px 30px rgb(33 148 138 / 0.10)`), padding generoso.
- **Botón principal:** forma de píldora (`border-radius: 999px`), color `--agua-600`, hover en `--agua-700` con un ligero levantamiento (`translateY(-1px)`).
- **Botón secundario** ("Cerrar sesión"): texto `--agua-700`, sin fondo, discreto al final de la página.
- **Campos (`input` y `textarea`):** fondo blanco, borde `--agua-200`, `border-radius: 16px`. Al enfocar, el borde pasa a `--agua-500` con un halo suave. El `textarea` crece y no tiene bordes duros.
- **Navegación** "Hoy / Historial": dos píldoras en un contenedor redondeado (control segmentado). La página activa se marca con fondo `--agua-600`. Sustituye a los enlaces separados por `|`.
- **Mensajes de estado:**
  - "¡Guardado!": verde `--agua-700` con una pequeña gota ✓
  - errores: `--rubi-500` sobre `--rubi-50`
- **Respuesta cerrada:** el `textarea` de solo lectura se ve como texto de carta sobre `--agua-100`, sin borde, con un candado o sello pequeño.
- **Respuesta de la pareja:** una tarjeta con el nombre en `--rubi-500` y un borde izquierdo de 4 px en `--rubi-300`. Si aún no está disponible, se muestra un mensaje en cursiva gris-agua con una gota animada que "espera".

## 4. Pantallas
**Login (`index.html`)**
- Tarjeta centrada vertical y horizontalmente.
- Encima, el logotipo "Lluvia" en Fraunces con una nube y gotas en SVG inline.
- Debajo, una frase corta: *"Una pregunta al día, para conocernos un poquito más."*
- El error aparece dentro de la tarjeta.

**Hoy (`home.html`)**
1. Cabecera: "Hola, Vadhir" (Fraunces) y debajo el contador "♥ Llevamos 14 días juntos", con el corazón en rubí.
2. Navegación segmentada.
3. Tarjeta grande con la pregunta:
   - etiqueta pequeña "Pregunta #2 · sábado 10 de octubre" en `--agua-500`
   - la pregunta en Fraunces grande
   - el formulario de respuesta
4. Tarjeta de la pareja.
5. "Cerrar sesión" al final.

**Historial (`historial.html`)**
- Cada día es una tarjeta, con una línea de tiempo vertical punteada en `--agua-200` que las une. Cada punto de la línea es una gota.
- Dentro, las dos respuestas lado a lado en escritorio y apiladas en el móvil.
- Se eliminan los `<hr>`; el espacio entre tarjetas hace de separador.

## 5. Ambiente "lluvia"
- **Fondo:** blanco. Las tarjetas se distinguen por un borde finito `--agua-100` y una sombra muy suave. (Cambio tras la primera revisión: antes era un degradado verde agua.)
- **Gotas:**
  - unas pocas gotas SVG en `--agua-300`, con opacidad entre 0.15 y 0.3, que caen muy despacio (entre 12 y 20 s por gota) detrás del contenido
  - solo 6–8 gotas, con `pointer-events: none`, para que no distraigan ni gasten batería
  - con `prefers-reduced-motion` quedan quietas
- **Entrada:** las tarjetas aparecen con un *fade + subida* de 8 px (400 ms, `ease-out`), escalonado.
- Al guardar, una sola onda circular sale del botón, como una gota que cae en un charco.

## 6. Modo noche
Descartado: la web se ve **siempre en claro**, con fondo blanco, aunque el dispositivo esté en modo oscuro (`color-scheme: light`).

## 7. Accesibilidad y detalles
- Contraste AA en todo el texto: ver la tabla de la paleta.
- Foco visible con `outline` en `--agua-500` y separación de 3 px.
- Objetivos táctiles de al menos 44 px.
- Margen lateral de 16 px en el móvil y ancho máximo de 640 px en escritorio.
- `<meta name="theme-color" content="#21948A">`, para que la barra del navegador del móvil se tiña del color principal.
- Favicon: una gota SVG en `#21948A`.

## 8. Cambios técnicos necesarios
- `css/styles.css`: reescritura completa con las variables y los componentes.
- Los tres HTML:
  - enlazar Google Fonts y añadir `theme-color` y el favicon
  - envolver las secciones en `.tarjeta`
  - marcar la navegación activa con `aria-current="page"`
  - añadir el contenedor de las gotas
  - quitar el `style` inline de `#respuesta-pareja`
- `js/historial.js`: dejar de crear los `<hr>` y usar clases (`.dia`, `.respuesta`, `.respuesta--pareja`) en lugar de estilos inline.
- `js/home.js`: añadir clases de estado (`.estado--ok`, `.estado--error`) y `.respuesta-cerrada`. La lógica no cambia.
- `js/login.js`: añadir la clase de error al mensaje.
- La lógica y la seguridad no cambian.

## 9. Orden de trabajo
1. Variables y base: fuentes, fondo, texto.
2. Componentes: tarjeta, botones, campos, navegación.
3. Login.
4. Hoy.
5. Historial.
6. Ambiente: gotas y animaciones.
7. Revisión en el móvil (375 px) y en escritorio, y comprobación de contraste.

## Verificación
- Servir la web con `python -m http.server` y revisar cada pantalla en el móvil (con DevTools) y en escritorio.
- Probar los estados:
  - sin responder
  - respondida
  - cerrada
  - pareja pendiente
  - error de login
  - historial vacío
- Probar `prefers-reduced-motion` desde DevTools → Rendering, y que con el sistema en modo oscuro la web siga en blanco.
