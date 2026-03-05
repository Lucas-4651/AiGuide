// public/js/challenge.js
(function() {
  const challengeBtn = document.getElementById('challengeBtn');
  const challengeMsg = document.getElementById('challengeMessage');
  
  if (!challengeBtn || !challengeMsg) return;
  
  window.completeDailyChallenge = async function() {
    challengeBtn.disabled = true;
    challengeBtn.textContent = '⏳ Validation...';
    
    try {
      const response = await fetch('/api/challenge/complete', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      if (!response.ok) throw new Error('Erreur réseau');
      
      const data = await response.json();
      
      if (data.ok) {
        challengeBtn.outerHTML = '<span style="color:var(--gr);font-weight:700">✓ Bravo ! Streak actuel: 🔥 ' + data.streak + ' jours</span>';
      } else {
        challengeMsg.innerHTML = '<span style="color:var(--rd);">❌ ' + (data.message || 'Erreur inconnue') + '</span>';
        challengeBtn.disabled = false;
        challengeBtn.textContent = '✓ Marquer comme complété';
      }
    } catch (error) {
      console.error('Erreur:', error);
      challengeMsg.innerHTML = '<span style="color:var(--rd);">❌ Erreur de connexion. Réessaie plus tard.</span>';
      challengeBtn.disabled = false;
      challengeBtn.textContent = '✓ Marquer comme complété';
    }
  };
})();