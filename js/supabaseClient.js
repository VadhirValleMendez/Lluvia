// Crea el cliente de Supabase una sola vez y lo comparte con las demás páginas.
// "supabase" viene de la librería cargada por CDN en el HTML.
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase inicia sesión con correo, no con "usuario".
// Aquí convertimos el nombre de usuario en un correo interno.
// Estos correos NO son secretos; lo secreto es la contraseña (que vive en Supabase).
const CORREOS = {
  vadhir: "vadhir@lluvia.app",
  loredana: "loredana@lluvia.app",
};

// Nombre bonito para mostrar en el saludo
const NOMBRES = {
  "vadhir@lluvia.app": "Vadhir",
  "loredana@lluvia.app": "Loredana",
};
