// ============================================================
// flashcards.js - Script pour les Flash Cards interactives
// ============================================================

(function() {
  // Récupérer le nombre total de cartes depuis l'attribut data
  const cardsGrid = document.getElementById('cardsGrid');
  const total = cardsGrid ? cardsGrid.children.length : 0;
  
  // Set pour suivre les cartes vues
  let seen = new Set();
  
  // Charger la progression depuis localStorage
  function loadProgress() {
    try {
      const saved = localStorage.getItem('flashcards_progress');
      if (saved) {
        const data = JSON.parse(saved);
        seen = new Set(data.seen || []);
        
        // Restaurer l'état des cartes
        seen.forEach(index => {
          const card = document.querySelector(`.flashcard[data-index="${index}"]`);
          if (card) card.classList.add('flipped');
        });
        
        updateProgress();
      }
    } catch (e) {
      console.error('Erreur chargement progression:', e);
    }
  }
  
  // Sauvegarder la progression
  function saveProgress() {
    try {
      localStorage.setItem('flashcards_progress', JSON.stringify({
        seen: Array.from(seen),
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Erreur sauvegarde progression:', e);
    }
  }
  
  // Mettre à jour l'affichage de la progression
  function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
      const pct = total > 0 ? Math.round((seen.size / total) * 100) : 0;
      progressFill.style.width = pct + '%';
      progressText.textContent = seen.size + ' / ' + total + ' vues';
    }
    
    saveProgress();
  }
  
  // Fonction pour retourner une carte
  window.flipCard = function(cardElement) {
    if (!cardElement) return;
    
    cardElement.classList.toggle('flipped');
    
    // Ajouter à la liste des vues
    const index = cardElement.dataset.index;
    if (index) {
      seen.add(index);
      updateProgress();
    }
    
    // Ajouter une animation subtile
    cardElement.style.transform = 'scale(0.98)';
    setTimeout(() => {
      cardElement.style.transform = 'scale(1)';
    }, 200);
  };
  
  // Réinitialiser la progression
  window.resetProgress = function() {
    if (confirm('Réinitialiser ta progression sur toutes les cartes ?')) {
      seen.clear();
      document.querySelectorAll('.flashcard').forEach(card => {
        card.classList.remove('flipped');
      });
      updateProgress();
      localStorage.removeItem('flashcards_progress');
    }
  };
  
  // Initialiser
  document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    
    // Ajouter des raccourcis clavier (optionnel)
    document.addEventListener('keydown', (e) => {
      // Espace pour retourner la carte active
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        const activeCard = document.querySelector('.flashcard:hover');
        if (activeCard) {
          flipCard(activeCard);
        }
      }
      
      // R pour reset
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        resetProgress();
      }
    });
  });
})();