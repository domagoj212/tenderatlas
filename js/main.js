/* main.js — spojeno i očišćeno */

/* Utility: safe query selector */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

/* ===== LENIS SMOOTH SCROLL ===== */
let lenis;
function initSmoothScroll() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Make anchor links work with Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -70, duration: 1.4 });
      }
    });
  });
}

/* ===== PROXIMITY SCROLL SNAP ===== */
function initScrollSnap() {
  const NAV_HEIGHT = 70;
  const SNAP_ZONE = 80;   // px — only snap when this close to a section edge
  const IDLE_MS = 80;     // ms — react quickly after scroll stops
  let idleTimer = null;
  let isSnapping = false;
  let lastScroll = 0;
  let velocity = 0;
  let velTimer = null;

  function getSections() {
    return Array.from(document.querySelectorAll('section:not([style*="display:none"]):not([style*="display: none"])'));
  }

  // Track scroll velocity so we don't snap while user has momentum
  window.addEventListener('scroll', () => {
    const now = performance.now();
    const dt = now - (velTimer || now);
    const dy = Math.abs(window.scrollY - lastScroll);
    velocity = dt > 0 ? dy / dt : 0; // px per ms
    lastScroll = window.scrollY;
    velTimer = now;
  }, { passive: true });

  function nearestSection() {
    const scrollY = window.scrollY;
    const sections = getSections();
    let closest = null;
    let minDist = Infinity;

    sections.forEach(s => {
      const top = s.getBoundingClientRect().top + scrollY - NAV_HEIGHT;
      const d = Math.abs(scrollY - top);
      if (d < minDist) { minDist = d; closest = top; }
    });

    // Also consider page top (hero)
    if (scrollY < minDist) { minDist = scrollY; closest = 0; }

    return { target: closest, dist: minDist };
  }

  function trySnap() {
    if (isSnapping) return;
    if (velocity > 0.3) return; // still has momentum, skip

    const { target, dist } = nearestSection();
    if (dist < 2 || dist > SNAP_ZONE) return; // already there or too far

    // Scale duration by distance — short nudge = fast, bigger = slightly longer
    const dur = 0.25 + (dist / SNAP_ZONE) * 0.2; // 0.25s – 0.45s

    isSnapping = true;
    lenis.scrollTo(target, {
      duration: dur,
      easing: (t) => 1 - Math.pow(1 - t, 2), // simple ease-out quad
      onComplete: () => { isSnapping = false; }
    });
    setTimeout(() => { isSnapping = false; }, 700);
  }

  window.addEventListener('scroll', () => {
    if (isSnapping) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(trySnap, IDLE_MS);
  }, { passive: true });
}

/* ===== SCROLL REVEAL ANIMATION (enhanced with stagger depth) ===== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ===== SCROLL-DRIVEN PARALLAX (multiple layers) ===== */
function initScrollParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  const heroLogo = document.querySelector('.hero-logo');
  const heroSubtitle = document.querySelector('.hero p');
  const heroCta = document.querySelector('.hero .cta');
  const sectionHeadings = document.querySelectorAll('section h2');

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // Hero content parallax fade-out on scroll
        if (heroLogo) {
          const heroProgress = Math.min(scrollY / (vh * 0.6), 1);
          heroLogo.style.transform = `translateY(${scrollY * 0.25}px) scale(${1 - heroProgress * 0.1})`;
          heroLogo.style.opacity = 1 - heroProgress * 0.8;
        }
        if (heroSubtitle) {
          const heroProgress = Math.min(scrollY / (vh * 0.6), 1);
          heroSubtitle.style.transform = `translateY(${scrollY * 0.15}px)`;
          heroSubtitle.style.opacity = 1 - heroProgress * 0.8;
        }
        if (heroCta) {
          const heroProgress = Math.min(scrollY / (vh * 0.6), 1);
          heroCta.style.transform = `translateY(${scrollY * 0.1}px)`;
          heroCta.style.opacity = 1 - heroProgress * 0.9;
        }

        // Section headings subtle parallax
        sectionHeadings.forEach(h => {
          const rect = h.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            const progress = (vh - rect.top) / (vh + rect.height);
            h.style.transform = `translateY(${(0.5 - progress) * -15}px)`;
          }
        });

        // Custom parallax elements
        parallaxElements.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const rect = el.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            const center = rect.top + rect.height / 2 - vh / 2;
            el.style.transform = `translateY(${center * speed}px)`;
          }
        });

        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ===== NAV SCROLL EFFECT ===== */
function initNavScroll() {
  const nav = document.querySelector('.fixed-nav');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 80) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ===== ANIMATED STAT COUNTERS ===== */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        
        // Extract number and suffix (e.g., "50K+" -> 50, "K+")
        const match = text.match(/^([\d.]+)(.*)$/);
        if (match) {
          const target = parseFloat(match[1]);
          const suffix = match[2];
          animateCounter(el, target, suffix);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target, suffix) {
  const duration = 1500;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;
  
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = ease * target;
    
    if (isDecimal) {
      el.textContent = current.toFixed(1) + suffix;
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }
  
  requestAnimationFrame(update);
}

/* ===== SMOOTH PARALLAX FOR GLOW ORBS ===== */
function initParallax() {
  const orbs = document.querySelectorAll('.glow-orb');
  if (!orbs.length) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        orbs.forEach((orb, i) => {
          const speed = 0.03 + (i * 0.015);
          orb.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ===== SCROLL PROGRESS BAR ===== */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  });
}

/* ===== SECTION ACTIVE TRACKING (smart nav highlights) ===== */
function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-70px 0px -30% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* Modal control */
function openModal() {
  const modal = document.getElementById("infoModal");
  if (modal) modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("infoModal");
  if (modal) modal.style.display = "none";
}

/* Open contact form from modal */
function goToContactForm() {
  closeModal();
  const formSection = document.getElementById('contactFormSection');
  if (!formSection) return;
  formSection.style.display = 'block';
  formSection.scrollIntoView({ behavior: 'smooth' });
}

/* Toggle company field (used by select in the form) */
function toggleCompanyField() {
  const type = (document.getElementById('personType') || {}).value;
  const companyField = document.getElementById('companyField');
  const companySizeField = document.getElementById('companySizeField');
  const companyNameInput = document.getElementById('companyName');
  const companySizeInput = document.getElementById('companySize');
  
  if (!companyField) return;
  
  if (type === 'pravna') {
    companyField.style.display = 'block';
    if (companySizeField) companySizeField.style.display = 'block';
    if (companyNameInput) companyNameInput.setAttribute('required', 'required');
    if (companySizeInput) companySizeInput.setAttribute('required', 'required');
  } else {
    companyField.style.display = 'none';
    if (companySizeField) companySizeField.style.display = 'none';
    if (companyNameInput) companyNameInput.removeAttribute('required');
    if (companySizeInput) companySizeInput.removeAttribute('required');
  }
}

/* Build the hover overlay (single instance factory) */
function createHoverOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'pb-hover-overlay';
  // Minimal inline styles — prefer moving to CSS later if desired
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.55)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '9999';

  const message = document.createElement('div');
  message.style.maxWidth = '420px';
  message.style.padding = '28px';
  message.style.borderRadius = '12px';
  message.style.textAlign = 'center';
  message.style.background = 'rgba(12,16,20,0.95)';
  message.style.color = '#fff';
  message.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';

  message.innerHTML = `
    <h2 style="margin:0 0 10px;">Alat vam je koristan?</h2>
    <p style="margin:0 0 18px;">Kontaktirajte nas i pretplatite se na puni pristup.</p>
  `;

  const okBtn = document.createElement('button');
  okBtn.textContent = 'OK';
  okBtn.style.padding = '10px 18px';
  okBtn.style.borderRadius = '8px';
  okBtn.style.cursor = 'pointer';
  okBtn.style.border = 'none';
  okBtn.style.fontWeight = '600';

  okBtn.addEventListener('click', () => {
    if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
  });

  message.appendChild(okBtn);
  overlay.appendChild(message);
  return overlay;
}

/* DOM ready */
document.addEventListener('DOMContentLoaded', () => {

  // Initialize smooth scroll & animations
  initSmoothScroll();
  initScrollSnap();
  initScrollReveal();
  initNavScroll();
  initCounters();
  initParallax();
  initScrollParallax();
  initScrollProgress();
  initActiveSection();
  initHamburger();
  initBackToTop();

  // 1) Image cards that open modal (elements with .iframe-box.no-crop)
  const imgCards = $$('.iframe-box.no-crop');
  imgCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', openModal);
  });

  // 2) Hover timer for iframe dashboards (only .iframe-box that are NOT .no-crop)
  const iframeBoxes = $$('.iframe-box:not(.no-crop)');
  iframeBoxes.forEach(box => {
    let timerId = null;
    let overlay = null;

    const startTimer = () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        // avoid adding more than one overlay
        if (!overlay) {
          overlay = createHoverOverlay();
          document.body.appendChild(overlay);
        }
      }, 45000); // 45 seconds
    };

    const stopTimer = () => {
      clearTimeout(timerId);
      if (overlay && overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
        overlay = null;
      }
    };

    box.addEventListener('mouseenter', startTimer);
    box.addEventListener('mouseleave', stopTimer);

    // if user clicks inside iframe-box (e.g., to interact), stop timer too
    box.addEventListener('mousedown', stopTimer);
    box.addEventListener('touchstart', stopTimer);
  });

  // 3) Contact form show/hide using the "#openContactForm" button (already in HTML)
  const openContactBtn = document.getElementById('openContactForm');
  const formSection = document.getElementById('contactFormSection');
  if (openContactBtn && formSection) {
    openContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // toggle visibility
      const isHidden = getComputedStyle(formSection).display === 'none';
      formSection.style.display = isHidden ? 'block' : 'none';
      if (isHidden) formSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 4) Hero CTA — scroll to contact section and open form
  const heroCTA = document.getElementById('heroCTA');
  if (heroCTA && formSection) {
    heroCTA.addEventListener('click', (e) => {
      e.preventDefault();
      formSection.style.display = 'block';
      if (typeof lenis !== 'undefined') {
        lenis.scrollTo(formSection, { offset: -70, duration: 1.4 });
      } else {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 5) Contact form: toggle company field when select changes
  const personTypeSelect = document.getElementById('personType');
  if (personTypeSelect) {
    personTypeSelect.addEventListener('change', toggleCompanyField);
    // set initial visibility
    toggleCompanyField();
  }

  // 6) Form submission (AJAX) using FormData -> Formspree
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (contactForm && formMessage) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formMessage.textContent = '';

      // Loading state
      const submitBtn = document.getElementById('formSubmitBtn');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Slanje...';
        submitBtn.style.opacity = '0.7';
      }

      const fd = new FormData(contactForm);

      fetch('https://formspree.io/f/mkogrgyz', {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      })
      .then(async response => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.opacity = '1';
        }
        if (response.ok) {
          formMessage.innerText = "Hvala, vaša poruka je poslana! Kontaktirati ćemo Vas povratno";
          contactForm.reset();
          toggleCompanyField();
        } else {
          let errText = "Ups! Došlo je do greške, pokušajte ponovno.";
          try {
            const json = await response.json();
            if (json && json.error) errText = json.error;
          } catch (_) {}
          formMessage.innerText = errText;
        }
      })
      .catch(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.opacity = '1';
        }
        formMessage.innerText = "Ups! Došlo je do greške, pokušajte ponovno.";
      });
    });
  }

  // 7) Modal buttons: attach close handlers (in case markup added but handlers not bound)
  const modalOverlay = document.getElementById('infoModal');
  if (modalOverlay) {
    // click outside modal-box closes
    modalOverlay.addEventListener('click', (ev) => {
      if (ev.target === modalOverlay) closeModal();
    });
  }

  // Attach modal buttons that run goToContactForm / closeModal if they exist
  $$('.modal-buttons .btn-primary').forEach(b => b.addEventListener('click', goToContactForm));
  $$('.modal-buttons .btn-secondary').forEach(b => b.addEventListener('click', closeModal));

  // 8) Navigation "Kontaktiraj nas" link - auto-expand contact form when clicked
  const navKontakt = document.getElementById('navKontakt');
  if (navKontakt && formSection) {
    navKontakt.addEventListener('click', (e) => {
      // Let the anchor navigate to #kontakt, then expand the form after a small delay
      setTimeout(() => {
        formSection.style.display = 'block';
      }, 300);
    });
  }
});

/* ===== HAMBURGER MENU ===== */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    overlay.classList.toggle('active');
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (lenis) isOpen ? lenis.stop() : lenis.start();
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.8) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    if (typeof lenis !== 'undefined') {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}





