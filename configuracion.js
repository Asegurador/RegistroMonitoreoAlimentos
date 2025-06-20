// ✅ Lógica de Cierre de Sesión y Control de Inactividad para Monitoreo.html

// Tiempo en milisegundos (5 min) para inactividad
const TIEMPO_INACTIVIDAD = 5 * 60 * 1000;
let timeoutInactividad; // Variable para almacenar el ID del temporizador

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('autenticado'); // Elimina el indicador de sesión
    localStorage.removeItem('ultimoAcceso'); // Limpia el último acceso
    
    // Opcional: Cambia la visibilidad de los contenedores
    const loginContainer = document.getElementById("loginContainer");
    const sistemaContainer = document.getElementById("sistemaContainer");
    if (loginContainer && sistemaContainer) { // Se asegura de que existan antes de usarlos
        loginContainer.classList.remove("hidden");
        sistemaContainer.classList.add("hidden");
    }

    // Redirigir a la página de login (index.html)
    window.location.href = "index.html";
}

// Función para verificar la sesión al cargar la página
function verificarSesion() {
    const autenticado = localStorage.getItem('autenticado');
    if (autenticado !== 'true') {
        window.location.href = "index.html"; // No autenticado, redirige al login
    } else {
        // Si está autenticado, reinicia el temporizador de inactividad
        resetInactividad();
    }
}

// Función para actualizar el último acceso y reiniciar el temporizador
function actualizarUltimoAcceso() {
    localStorage.setItem('ultimoAcceso', Date.now().toString());
    resetInactividad(); // Reinicia el temporizador en cada actividad
}

// Función para resetear el temporizador de inactividad
function resetInactividad() {
    clearTimeout(timeoutInactividad); // Limpia cualquier temporizador existente
    timeoutInactividad = setTimeout(() => {
        alert("⏳ Sesión cerrada por inactividad.");
        cerrarSesion(); // Llama a cerrarSesion(), que ahora redirigirá
    }, TIEMPO_INACTIVIDAD);
}

// Eventos para detectar actividad y actualizar el tiempo
document.addEventListener("mousemove", actualizarUltimoAcceso);
document.addEventListener("keydown", actualizarUltimoAcceso);
document.addEventListener("click", actualizarUltimoAcceso);

// Ejecutar la verificación de sesión cuando la página de Monitoreo se carga
document.addEventListener("DOMContentLoaded", verificarSesion);

// Aquí podrías tener más funciones JS relacionadas con la configuración o el monitoreo,
// si tu archivo "configuracion.js" también contiene otras lógicas.
// Si no, este archivo solo contendrá la lógica de sesión.
