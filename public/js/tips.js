// ============================================================
// tips.js - Script pour la page Astuces & Techniques IA
// ============================================================

(function() {
  // Animation au scroll pour les cartes
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Initialiser les cartes avec animation
  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.tip-card');
    
    cards.forEach((card, index) => {
      // Style initial pour l'animation
      card.style.opacity = '0';
      card.style.transform = 'translateX(-20px)';
      card.style.transition = 'all 0.3s ease';
      card.style.transitionDelay = (index * 0.1) + 's';
      
      observer.observe(card);
    });
    
    // Filtrer par difficulté (si tu veux ajouter des filtres)
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty');
    
    if (difficulty) {
      const filterBtn = document.querySelector(`.difficulty-filter[data-difficulty="${difficulty}"]`);
      if (filterBtn) filterBtn.classList.add('active');
    }
  });
})();