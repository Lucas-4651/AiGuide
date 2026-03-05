/* ============================================================
   main.js - Scripts globaux pour AI Guide
   ============================================================ */

/* ── THEME MANAGEMENT ───────────────────────────────────── */
const THEME_STORAGE_KEY = 'aig-theme';

/**
 * Applique le thème (dark/light) et met à jour l'interface
 * @param {string} theme - 'dark' ou 'light'
 */
function applyTheme(theme) {
  // Appliquer le thème au document
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  
  // Mettre à jour les boutons de thème
  const icon = theme === 'dark' ? '☀️' : '🌙';
  const title = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
  
  document.querySelectorAll('.th-btn, .auth-th').forEach(btn => {
    btn.textContent = icon;
    btn.setAttribute('title', title);
    btn.setAttribute('aria-label', title);
  });
}

/**
 * Bascule entre les thèmes dark/light
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

// Initialiser le thème au chargement
(function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  applyTheme(savedTheme);
})();


/* ── MOBILE NAVIGATION ─────────────────────────────────── */
const navToggle = document.getElementById('navTog');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  // Ouvrir/fermer le menu
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('open');
    
    // Accessibilité : aria-expanded
    const isOpen = navLinks.classList.contains('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  
  // Fermer le menu en cliquant ailleurs
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Fermer le menu après clic sur un lien
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ── ALERTS / MESSAGES FLASH ───────────────────────────── */
function setupAlerts() {
  document.querySelectorAll('.alert').forEach(alert => {
    // Bouton de fermeture manuelle
    const closeBtn = alert.querySelector('.al-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        alert.remove();
      });
    }
    
    // Auto-fermeture après 5 secondes avec animation
    setTimeout(() => {
      if (alert && alert.parentNode) {
        alert.style.transition = 'opacity 0.3s ease';
        alert.style.opacity = '0';
        
        setTimeout(() => {
          if (alert && alert.parentNode) {
            alert.remove();
          }
        }, 300);
      }
    }, 5000);
  });
}

// Exécuter au chargement et après chaque navigation (si SPA-like)
document.addEventListener('DOMContentLoaded', setupAlerts);

// Pour les mises à jour AJAX, on peut réexécuter
// Exemple: document.addEventListener('contentUpdated', setupAlerts);


/* ── AUTO SLUG GENERATION (pour formulaires admin) ─────── */
const nameInput = document.querySelector('input[name="name"]');
const slugInput = document.querySelector('input[name="slug"]');

if (nameInput && slugInput) {
  // Générer automatiquement le slug à partir du nom
  nameInput.addEventListener('input', () => {
    // Ne pas écraser si l'utilisateur a déjà modifié manuellement
    if (!slugInput.dataset.manuallyEdited) {
      slugInput.value = nameInput.value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // remplacer les espaces par -
        .replace(/[^a-z0-9-]/g, '')      // supprimer les caractères spéciaux
        .replace(/-+/g, '-')              // éviter les doubles tirets
        .replace(/^-|-$/g, '');           // supprimer tirets début/fin
    }
  });
  
  // Marquer comme édité manuellement
  slugInput.addEventListener('input', () => {
    slugInput.dataset.manuallyEdited = 'true';
  });
  
  // Réinitialiser le flag si le slug est vidé
  slugInput.addEventListener('blur', () => {
    if (slugInput.value === '') {
      delete slugInput.dataset.manuallyEdited;
    }
  });
}


/* ── SCROLL TO TOP ─────────────────────────────────────── */
function setupScrollToTop() {
  const scrollBtn = document.getElementById('scrollTop');
  
  if (!scrollBtn) {
    // Créer le bouton s'il n'existe pas
    const btn = document.createElement('button');
    btn.id = 'scrollTop';
    btn.className = 'scroll-top';
    btn.setAttribute('aria-label', 'Retour en haut');
    btn.innerHTML = '↑';
    btn.style.cssText = `
      display: none;
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--ac);
      color: white;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 99;
      transition: all 0.2s;
      align-items: center;
      justify-content: center;
    `;
    document.body.appendChild(btn);
    
    // Hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 6px 16px rgba(124,92,252,0.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });
    
    setupScrollToTop(); // Re-run avec le bouton créé
    return;
  }
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollBtn.style.display = 'flex';
    } else {
      scrollBtn.style.display = 'none';
    }
  });
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Initialiser scroll to top
document.addEventListener('DOMContentLoaded', setupScrollToTop);


/* ── UTILS ─────────────────────────────────────────────── */

/**
 * Debounce une fonction (pour recherche, resize, etc.)
 * @param {Function} func - La fonction à debouncer
 * @param {number} wait - Temps d'attente en ms
 * @returns {Function} - Fonction debouncée
 */
function debounce(func, wait = 200) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Exemple d'utilisation : 
// window.addEventListener('resize', debounce(() => {
//   console.log('Resize stopped');
// }, 250));


/* ── KEYBOARD SHORTCUTS ────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  // / pour focus search (si modal existe)
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && document.getElementById('searchModal')?.style.display === 'block') {
      e.preventDefault();
      searchInput.focus();
    }
  }
  
  // ? pour afficher l'aide (optionnel)
  if (e.key === '?' && e.shiftKey) {
    e.preventDefault();
    console.log('Raccourcis disponibles: Ctrl+K (recherche), / (focus recherche), ? (aide)');
    // Tu peux afficher un modal d'aide ici
  }
});


/* ── EXPOSITION GLOBALE (si nécessaire) ─────────────────── */
window.AI = window.AI || {};
window.AI.utils = {
  debounce,
  applyTheme,
  toggleTheme
};

console.log('✨ main.js chargé - AI Guide');