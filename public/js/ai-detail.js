// ============================================================
// ai-detail.js - Script pour la page de détail d'une IA
// ============================================================

(function() {
  // Variable globale pour la note
  let _rating = typeof window._rating !== 'undefined' ? window._rating : 0;
  
  // Initialiser si les données sont passées par EJS
  if (typeof window.initialRating !== 'undefined') {
    _rating = window.initialRating;
  }

  // Définir la note
  window.setRating = function(n) {
    _rating = n;
    const ratingInput = document.getElementById('ratingVal');
    if (ratingInput) ratingInput.value = n;
    
    // Mettre à jour l'affichage des étoiles
    document.querySelectorAll('#starPicker span').forEach((star, index) => {
      star.style.opacity = index < n ? '1' : '.3';
    });
  };

  // Basculer l'affichage du formulaire
  window.toggleReviewForm = function() {
    const form = document.getElementById('reviewForm');
    if (form) {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
  };

  // Poster un avis
  window.postReview = async function(e, aiId) {
    e.preventDefault();
    
    if (!_rating) {
      alert('Choisis une note');
      return;
    }
    
    const comment = document.getElementById('reviewComment').value;
    
    try {
      const response = await fetch('/api/reviews/' + aiId, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ rating: _rating, comment }) 
      });
      
      const data = await response.json();
      
      if (data.ok) {
        location.reload();
      } else {
        alert('Erreur : ' + (data.message || 'Impossible de publier l\'avis'));
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  // Supprimer un avis
  window.deleteReview = async function(aiId) {
    if (!confirm('Supprimer ton avis ?')) return;
    
    try {
      await fetch('/api/reviews/' + aiId, { method: 'DELETE' });
      location.reload();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  // Gestion des favoris
  window.toggleFavDetail = async function(aiId, btn) {
    if (!btn.dataset.auth) { 
      window.location = '/auth/login'; 
      return; 
    }
    
    try {
      const response = await fetch('/api/favorites/' + aiId, { method: 'POST' });
      const data = await response.json();
      
      if (data.ok) {
        btn.innerHTML = data.added ? '❤️ Favori' : '🤍 Ajouter aux favoris';
        btn.style.color = data.added ? 'var(--re)' : '';
      }
    } catch (error) {
      console.error('Erreur favori:', error);
    }
  };
})();