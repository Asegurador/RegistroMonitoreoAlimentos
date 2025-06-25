// =============================
// Protecciones avanzadas para webs
// Archivo: seguridad_pro.js
// =============================

// 1. Bloquear clic derecho
window.addEventListener('contextmenu', e => e.preventDefault());

// 2. Bloquear clic izquierdo fuera de campos permitidos
window.addEventListener('mousedown', e => {
  if (e.button === 0 && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
    e.preventDefault();
  }
});

// 3. Bloquear teclas especiales y combinaciones peligrosas
window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  const tag = e.target.tagName;

  // Lista de teclas individuales (F keys) para bloquear
  const individualBlockedKeys = [
    'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'
  ];

  // Lista de caracteres para bloquear en combinación con Ctrl/Shift/Alt
  const combinationBlockedCharacters = [
    'u', 'i', 's', 'c', 'e', 'j', 'k', 'a', 'd', 'h', // Example: Ctrl+U (view source), Ctrl+Shift+I (devtools), Ctrl+S (save)
    'p', // Ctrl+P (print)
    'g', // Ctrl+G (find next)
    'x', 'v' // Ctrl+X (cut), Ctrl+V (paste) - Use with caution, as this can affect user input
  ];

  // Check for individual blocked keys (like F keys)
  if (individualBlockedKeys.includes(key)) {
    e.preventDefault();
  }

  // Check for blocked combinations (Ctrl/Shift/Alt + specific character)
  // Ensure that the key is NOT a modifier itself to avoid blocking Ctrl, Shift, Alt independently
  if (
    (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) && // Any modifier key is pressed
    !['control', 'alt', 'meta', 'shift'].includes(key) && // The pressed key is not a modifier itself
    combinationBlockedCharacters.includes(key) // The pressed key is in our combination blocked list
  ) {
    e.preventDefault();
  }

  // Previene Backspace/Delete fuera de inputs
  if ((key === 'delete' || key === 'backspace') && !['INPUT', 'TEXTAREA'].includes(tag)) {
    e.preventDefault();
  }
});

// 4. Protección básica en móviles (evitar selección y copiado)
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
