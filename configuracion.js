
      // ✅ Tiempo en milisegundos (5 min)
    const TIEMPO_EXPIRACION = 5 * 60 * 1000;
    let timeoutInactividad;

    // ✅ Función para iniciar sesión
    function login(event) {
      event.preventDefault();
      const u = document.getElementById("usuario").value;
      const c = document.getElementById("clave").value;

      const valido = USUARIOS.some(user => user.usuario === u && user.clave === c);
      if (valido) {
        sessionStorage.setItem("sesionActiva", "true");
        mostrarSistema();
        resetInactividad();
      } else {
        alert("❌ Usuario o contraseña incorrectos");
      }
    }

    // ✅ Mostrar contenido del sistema
    function mostrarSistema() {
      document.getElementById("loginContainer").classList.add("hidden");
      document.getElementById("sistemaContainer").classList.remove("hidden");
    }

    // ✅ Cerrar sesión
    function cerrarSesion() {
      sessionStorage.removeItem("sesionActiva");
      document.getElementById("loginContainer").classList.remove("hidden");
      document.getElementById("sistemaContainer").classList.add("hidden");
    }

    // ✅ Validar si hay sesión activa al cargar
    window.onload = function () {
      if (sessionStorage.getItem("sesionActiva") === "true") {
        mostrarSistema();
        resetInactividad();
      }
    };

    // ✅ Resetear temporizador por inactividad
    function resetInactividad() {
      clearTimeout(timeoutInactividad);
      timeoutInactividad = setTimeout(() => {
        alert("⏳ Sesión cerrada por inactividad");
        cerrarSesion();
      }, TIEMPO_EXPIRACION);
    }

    // ✅ Eventos para detectar actividad
    document.addEventListener("mousemove", resetInactividad);
    document.addEventListener("keydown", resetInactividad);

