# Lluvia

## Reglas de diseño (prioridad máxima)

1. **Colores del proyecto:**
   - **Principal:** `#21948A`
   - **Complementario:** `#94212B`
2. **Usar mucho más el principal y sus variaciones** (tonos claros y oscuros de `#21948A`) que el complementario. El complementario es un acento: se usa poco y con intención (detalles, corazones, errores, algo que deba destacar). Nunca como color de fondo grande.
3. El diseño debe transmitir **tranquilidad, suavidad y algo "lindo"**: esquinas redondeadas, sombras suaves, mucho espacio, movimientos lentos y discretos.
4. Contraste accesible (WCAG AA): `#21948A` sobre blanco da solo 3.7:1, así que **no se usa para texto normal ni para botones con texto blanco**. Para eso se usa un tono más oscuro del principal (`#1A766E` o más oscuro).
5. Los colores se definen como variables CSS en `:root` (`css/styles.css`); no se escriben colores sueltos en otros sitios.

El plan de diseño completo está en `PLAN_DISENO.md`.

## Qué es el proyecto

Diario de pareja privado para dos personas (Vadhir y Loredana): una pregunta al día. Cada uno responde, y solo ve la respuesta del otro después de responder la suya. Cuando existen las dos respuestas, ambas quedan cerradas.

- Sitio estático: HTML + CSS + JavaScript sin frameworks ni build. Se publica en GitHub Pages.
- Backend: Supabase (auth + Postgres), cargado por CDN.
- Todo el texto de la interfaz y los comentarios del código van en **español**.

## Reglas técnicas

- **La seguridad la aplica la base de datos (RLS), no el JavaScript.** El JS solo refleja las reglas en la interfaz.
- Pintar texto de usuario siempre con `textContent`, nunca con `innerHTML`.
- La pregunta nueva sale a las **7:00 de Ciudad de México**. Hay valores que deben coincidir en dos sitios:
  - `FECHA_INICIO` y `HORA_NUEVA_PREGUNTA` en `js/lluvia.js`
  - la fecha y el `interval '7 hours'` de `pregunta_de_hoy()` en `supabase/cierre_y_dia.sql`
- La carpeta `supabase/` está en `.gitignore` a propósito: el repositorio es público y `preguntas.sql` revelaría las preguntas futuras. Los cambios de SQL se ejecutan a mano en el SQL Editor de Supabase.
- `localStorage` siempre dentro de `try/catch` (ver los helpers de borrador en `js/lluvia.js`).
