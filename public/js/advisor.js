// ============================================================
// advisor.js - Script pour la page IA Advisor
// ============================================================

// Loader au submit du formulaire
(function() {
  const form = document.querySelector('form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Recherche en cours...';
    }
  });
})();