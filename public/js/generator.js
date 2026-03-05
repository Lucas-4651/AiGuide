// ============================================================
// generator.js - Script pour le générateur de prompts
// ============================================================

(function() {
  let currentPromptId = null;

  // Éléments DOM
  const generateBtn = document.getElementById('generateBtn');
  const intentionInput = document.getElementById('intentionInput');
  const targetAI = document.getElementById('targetAI');
  const isPublicEl = document.getElementById('isPublic');
  const resultCard = document.getElementById('resultCard');
  const errorCard = document.getElementById('errorCard');
  const resultPrompt = document.getElementById('resultPrompt');
  const resultMeta = document.getElementById('resultMeta');
  const errorMsg = document.getElementById('errorMsg');
  const copyBtn = document.getElementById('copyBtn');
  const ratingBtns = document.getElementById('ratingBtns');
  const errorRegisterBtn = document.getElementById('errorRegisterBtn');

  // Utilitaires d'affichage
  function setLoading(on) {
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    if (btnText) btnText.style.display = on ? 'none' : '';
    if (btnLoading) btnLoading.style.display = on ? 'inline' : 'none';
    if (generateBtn) generateBtn.disabled = on;
  }

  function showResult(prompt, tokens) {
    if (!resultPrompt || !resultMeta || !resultCard) return;
    
    resultPrompt.textContent = prompt;
    resultMeta.textContent = tokens ? '⚡ Tokens utilisés : ' + tokens : '';
    resultCard.style.display = 'block';
    
    // Créer les étoiles de notation
    if (ratingBtns) {
      ratingBtns.innerHTML = [1, 2, 3, 4, 5].map(n =>
        `<button onclick="window.ratePrompt(${n})" class="rating-btn" title="${n}/5">★</button>`
      ).join('');
    }
    
    // Scroll smooth vers le résultat
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideResult() {
    if (resultCard) resultCard.style.display = 'none';
  }

  function showError(message, showRegister = false) {
    if (!errorMsg || !errorCard) return;
    errorMsg.textContent = message;
    errorCard.style.display = 'flex';
    if (errorRegisterBtn) {
      errorRegisterBtn.style.display = showRegister ? 'inline-flex' : 'none';
    }
    
    // Scroll vers l'erreur
    errorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideError() {
    if (errorCard) errorCard.style.display = 'none';
    if (errorRegisterBtn) errorRegisterBtn.style.display = 'none';
  }

  // Génération du prompt
  window.generatePrompt = async function() {
    const intention = intentionInput?.value.trim();
    const target = targetAI?.value.trim();
    
    if (!intention || intention.length < 5) {
      showError('Intention trop courte (minimum 5 caractères)');
      intentionInput?.focus();
      return;
    }

    setLoading(true);
    hideResult();
    hideError();

    try {
      const res = await fetch('/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intention,
          target_ai: target,
          is_public: isPublicEl ? isPublicEl.checked : false
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Erreur inconnue', data.limitReached);
      } else {
        currentPromptId = data.id;
        showResult(data.prompt, data.tokens);
      }
    } catch (e) {
      showError('Erreur réseau — vérifie ta connexion');
    } finally {
      setLoading(false);
    }
  };

  // Copier le prompt
  window.copyPrompt = async function() {
    const text = resultPrompt?.textContent;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copié !';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  // Noter le prompt
  window.ratePrompt = async function(rating) {
    if (!currentPromptId) return;

    try {
      await fetch('/generator/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentPromptId, rating })
      });

      if (ratingBtns) {
        ratingBtns.innerHTML = `<span style="color: var(--ye); display: flex; align-items: center; gap: 0.25rem;">
          ★ ${rating}/5 <span style="color: var(--t2); font-size: 0.8rem;">— Merci !</span>
        </span>`;
      }
    } catch (error) {
      console.error('Erreur notation:', error);
    }
  };

  // Charger un prompt depuis l'historique
  window.loadPrompt = function(btn) {
    const prompt = decodeURIComponent(btn.dataset.prompt);
    if (resultPrompt) {
      resultPrompt.textContent = prompt;
      resultCard.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Event listeners
  if (generateBtn) {
    generateBtn.addEventListener('click', window.generatePrompt);
  }

  if (intentionInput) {
    // Ctrl+Enter pour générer
    intentionInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        window.generatePrompt();
      }
    });
  }
})();