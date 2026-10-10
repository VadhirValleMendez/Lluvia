const form = document.getElementById("login-form");
const mensaje = document.getElementById("mensaje");
const btnEntrar = form.querySelector("button[type=submit]");

// Si ya hay sesión iniciada, saltamos directo al home
db.auth.getSession().then(({ data }) => {
  if (data.session) {
    window.location.href = "home.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensaje.textContent = "";

  const usuario = document.getElementById("usuario").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  const correo = CORREOS[usuario];
  if (!correo) {
    mensaje.textContent = "Usuario o contraseña incorrectos.";
    return;
  }

  // Desactivamos el botón para evitar enviar dos veces
  btnEntrar.disabled = true;
  mensaje.textContent = "Entrando...";

  const { error } = await db.auth.signInWithPassword({
    email: correo,
    password: password,
  });

  if (error) {
    // Mensaje genérico a propósito: no revelamos qué falló
    console.error(error.message);
    mensaje.textContent = "Usuario o contraseña incorrectos.";
    btnEntrar.disabled = false;
    return;
  }

  window.location.href = "home.html";
});
