// i18n Language Switcher
(function() {
  'use strict';

  // Get current language from localStorage or default to 'hr'
  let currentLang = localStorage.getItem('language') || 'hr';

  // Set language
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);
    translatePage();
    updateLanguageToggle();
  }

  // Translate all elements with data-i18n attribute
  function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = translations[currentLang][key];
      
      if (translation) {
        // Check if element has data-i18n-html attribute for HTML content
        if (element.hasAttribute('data-i18n-html')) {
          element.innerHTML = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // Translate placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = translations[currentLang][key];
      if (translation) {
        element.setAttribute('placeholder', translation);
      }
    });
  }

  // Update language toggle button state
  function updateLanguageToggle() {
    const hrBtn = document.getElementById('lang-hr');
    const enBtn = document.getElementById('lang-en');
    
    if (hrBtn && enBtn) {
      if (currentLang === 'hr') {
        hrBtn.classList.add('active');
        enBtn.classList.remove('active');
      } else {
        enBtn.classList.add('active');
        hrBtn.classList.remove('active');
      }
    }
  }

  // Initialize on page load
  function init() {
    // Set initial language
    document.documentElement.setAttribute('lang', currentLang);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        translatePage();
        updateLanguageToggle();
        attachEventListeners();
      });
    } else {
      translatePage();
      updateLanguageToggle();
      attachEventListeners();
    }
  }

  // Attach event listeners to language toggle buttons
  function attachEventListeners() {
    const hrBtn = document.getElementById('lang-hr');
    const enBtn = document.getElementById('lang-en');
    
    if (hrBtn) {
      hrBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setLanguage('hr');
      });
    }
    
    if (enBtn) {
      enBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setLanguage('en');
      });
    }
  }

  // Expose setLanguage function globally
  window.setLanguage = setLanguage;

  // Initialize
  init();
})();
