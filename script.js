/* ── Premium Custom Cursor ── */
const cursorDot     = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (window.matchMedia('(min-width: 900px)').matches && cursorDot && cursorOutline) {

  let mouseX = -100, mouseY = -100;
  let outlineX = -100, outlineY = -100;

  /* Track real mouse position */
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    /* Dot snaps instantly */
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top  = `${mouseY}px`;
  }, { passive: true });

  /* Lerp-based trailing outline — smooth spring feel */
  const LERP = 0.22;
  function animateCursor() {
    outlineX += (mouseX - outlineX) * LERP;
    outlineY += (mouseY - outlineY) * LERP;
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top  = `${outlineY}px`;
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  /* Click burst effect */
  window.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  window.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  /* Hover detection on interactive elements */
  const hoverTargets = 'a, button, .project-card, .hamburger, [role="button"], label, input, textarea, select';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  /* Hide cursor when leaving window */
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity     = '0';
    cursorOutline.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity     = '1';
    cursorOutline.style.opacity = '1';
  });
}


/* ── Navbar scroll ── */
const navbar = document.getElementById('navbar');
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      updateActiveNav();
      updateScrollDepth(); // Added here for efficiency
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

/* ── Active nav link ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}
updateActiveNav();

/* ── Hamburger ── */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});
navLinksEl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinksEl.classList.remove('open'));
});

/* ── Reveal on scroll ── */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      /* Calculate stagger based on sibling position in parent */
      const siblings = entry.target.parentElement
        ? Array.from(entry.target.parentElement.children).filter(c => c.classList.contains('reveal'))
        : [];
      const siblingIdx = siblings.indexOf(entry.target);
      const delay = siblingIdx > 0 ? siblingIdx * 100 : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => revealObserver.observe(el));

/* ── Individual Skill Card stagger on scroll ── */
const skillCards = document.querySelectorAll('.skill-logo-card');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = Array.from(skillCards).indexOf(entry.target);
      entry.target.style.animationDelay = `${idx * 55}ms`;
      entry.target.style.animation = `reveal-zoom-up 0.6s cubic-bezier(0.34,1.56,0.64,1) ${idx * 55}ms forwards`;
      entry.target.style.opacity = '0';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
skillCards.forEach(card => {
  card.style.opacity = '0';
  skillObserver.observe(card);
});

/* ── Copy email ── */
function copyEmail() {
  navigator.clipboard.writeText('i.adityabiswas.in@gmail.com').then(() => {
    const btn = document.getElementById('copy-email-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> Email Copied!';
    btn.style.background = 'var(--purple)';
    btn.style.borderColor = 'var(--purple)';
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-copy"></i> Copy Email';
      btn.style.background = '';
      btn.style.borderColor = '';
    }, 2500);
  });
}

/* ── Smooth hero entrance ── */
window.addEventListener('load', () => {
  document.querySelectorAll('.hero-inner .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 300 + i * 200);
  });
});

/* ══════════════════════════════════════════
   3D CARD TILT — Throttled Helper
   ══════════════════════════════════════════ */
function applyTilt(el, e, settings = { max: 10, perspective: 900 }) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width  / 2);
  const dy = (e.clientY - cy) / (rect.height / 2);

  const rotX = -dy * settings.max;
  const rotY =  dx * settings.max;

  el.style.transform = `perspective(${settings.perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
}

/* ══════════════════════════════════════════
   BOOK CAROUSEL — Projects
   ══════════════════════════════════════════ */
(function initBookCarousel() {
  const track    = document.getElementById('book-track');
  const prevBtn  = document.getElementById('book-prev');
  const nextBtn  = document.getElementById('book-next');
  const dotBtns  = document.querySelectorAll('.book-dot');
  const pages    = document.querySelectorAll('.book-page');
  if (!track || !pages.length) return;

  let current   = 0;
  const total   = pages.length;
  let autoTimer = null;
  let isPaused  = false; // true while cursor is over the carousel

  /* ── slide to index ── */
  function goTo(idx, dir) {
    if (idx === current) return;

    /* Remove old entrance class from all pages */
    pages.forEach(p => p.classList.remove('entering-right', 'entering-left'));

    current = (idx + total) % total;

    /* Translate track */
    track.style.transform = `translateX(-${current * 100}%)`;

    /* Trigger entrance animation on incoming page */
    void pages[current].offsetWidth; // force reflow
    pages[current].classList.add(dir === 'right' ? 'entering-right' : 'entering-left');
    setTimeout(() => pages[current].classList.remove('entering-right', 'entering-left'), 750);

    /* Update dots */
    dotBtns.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  /* ── auto-advance every 8 seconds ── */
  function startAuto() {
    clearInterval(autoTimer); // always clear first to avoid stacking
    if (!isPaused) {
      autoTimer = setInterval(() => goTo(current + 1, 'right'), 8000);
    }
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1, 'left');  startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1, 'right'); startAuto(); });

  dotBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => { goTo(i, i > current ? 'right' : 'left'); startAuto(); });
  });

  /* ── Keyboard ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { goTo(current + 1, 'right'); startAuto(); }
    if (e.key === 'ArrowLeft')  { goTo(current - 1, 'left');  startAuto(); }
  });

  /* ── Touch / Swipe ── */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goTo(current + 1, 'right') : goTo(current - 1, 'left');
      startAuto();
    }
  }, { passive: true });

  /* ── Pause on hover — reliable with isPaused flag ── */
  const carousel = document.getElementById('book-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => {
      isPaused = true;
      clearInterval(autoTimer);
      autoTimer = null;
    });
    carousel.addEventListener('mouseleave', () => {
      isPaused = false;
      startAuto(); // only starts a fresh timer when truly leaving
    });
  }

  startAuto();
})();

/* ══════════════════════════════════════════
   3D TILT — Skill Logo Cards
   ══════════════════════════════════════════ */
document.querySelectorAll('.skill-logo-card').forEach(card => {
  let skillTicking = false;
  card.addEventListener('mousemove', (e) => {
    if (!skillTicking) {
      window.requestAnimationFrame(() => {
        applyTilt(card, e, { max: 8, perspective: 800 });
        card.style.transform += ' scale(1.05)';
        skillTicking = false;
      });
      skillTicking = true;
    }
  }, { passive: true });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
});


/* ══════════════════════════════════════════
   3D PARALLAX — Hero elements on mouse move
   ══════════════════════════════════════════ */
const heroSection = document.getElementById('hero');
if (heroSection) {
  const heroItems = {
    name: heroSection.querySelector('.hero-name'),
    role: heroSection.querySelector('.hero-role'),
    photo: heroSection.querySelector('.hero-photo-wrap'),
    social: heroSection.querySelector('.hero-social')
  };

  let heroTicking = false;
  heroSection.addEventListener('mousemove', (e) => {
    if (!heroTicking) {
      window.requestAnimationFrame(() => {
        const rect = heroSection.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width  - 0.5;
        const my = (e.clientY - rect.top)  / rect.height - 0.5;

        if (heroItems.name)   heroItems.name.style.transform   = `perspective(600px) rotateX(${-my*4}deg) rotateY(${mx*4}deg) translateZ(8px)`;
        if (heroItems.role)   heroItems.role.style.transform   = `perspective(600px) rotateX(${-my*3}deg) rotateY(${mx*3}deg) translateZ(4px)`;
        if (heroItems.photo)  heroItems.photo.style.transform  = `perspective(1000px) rotateX(${-my*6}deg) rotateY(${mx*6}deg) translateZ(20px)`;
        if (heroItems.social) heroItems.social.style.transform = `perspective(800px) translateX(${mx*8}px) translateY(${my*6}px)`;
        
        heroTicking = false;
      });
      heroTicking = true;
    }
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    Object.values(heroItems).forEach(el => {
      if (!el) return;
      el.style.transition = 'transform 0.7s cubic-bezier(.4,0,.2,1)';
      el.style.transform  = '';
      setTimeout(() => { el.style.transition = ''; }, 700);
    });
  });
}

/* ══════════════════════════════════════════
   3D FLOAT — Continuous hero photo animation
   ══════════════════════════════════════════ */
const heroPhotoWrap = document.querySelector('.hero-photo-wrap');
if (heroPhotoWrap) {
  let t = 0;
  let isHovered = false;

  heroPhotoWrap.parentElement.addEventListener('mouseenter', () => { isHovered = true; });
  heroPhotoWrap.parentElement.addEventListener('mouseleave', () => { isHovered = false; });

  function floatHeroPhoto() {
    if (!isHovered) {
      t += 0.012;
      const y = Math.sin(t) * 8;
      const rx = Math.sin(t * 0.7) * 2;
      const ry = Math.cos(t * 0.5) * 3;
      heroPhotoWrap.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${y}px)`;
    }
    requestAnimationFrame(floatHeroPhoto);
  }
  floatHeroPhoto();
}

/* ══════════════════════════════════════════
   3D — Scroll-driven depth effect on sections
   ══════════════════════════════════════════ */
function updateScrollDepth() {
  const vh = window.innerHeight;
  document.querySelectorAll('section[id]').forEach(sec => {
    const rect    = sec.getBoundingClientRect();
    const center  = rect.top + rect.height / 2;
    const dist    = (center - vh / 2) / vh;
    const clamp   = Math.max(-1, Math.min(1, dist));
    const scale   = 1 - Math.abs(clamp) * 0.018;
    sec.style.transform = `scale(${scale})`;
  });
}
/* Note: updateScrollDepth is now called within the throttled scroll listener above */

/* ══════════════════════════════════════════
   BACK TO TOP — Smooth Scroll & Interaction
   ══════════════════════════════════════════ */
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
  backToTopBtn.addEventListener('mouseenter', () => {
    backToTopBtn.style.transform = 'translate3d(0, -10px, 0) rotateY(15deg) scale(1.1)';
  });
  backToTopBtn.addEventListener('mouseleave', () => {
    backToTopBtn.style.transform = '';
  });

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════
   TOAST NOTIFICATION HELPER
   ══════════════════════════════════════════ */
function showToast(title, message, icon = 'fa-check') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${icon}"></i></div>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      <span class="toast-message">${message}</span>
    </div>`;

  container.appendChild(toast);
  toast.offsetHeight;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 600);
  }, 4000);
}

/* ══════════════════════════════════════════
   CONTACT FORM — Direct Submission (Formspree)
   ══════════════════════════════════════════ */
async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('.form-submit');
  const formspreeID = "mqegnleo"; 

  if (formspreeID === "YOUR_ENDPOINT_ID") {
    showToast('Setup Required', 'Please add your Formspree ID in script.js', 'fa-exclamation-triangle');
    return;
  }

  submitBtn.classList.add('btn-loading');

  try {
    const response = await fetch(`https://formspree.io/f/${formspreeID}`, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      showToast('Success!', 'Your message has been sent successfully.', 'fa-check-circle');
      form.reset();
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Submission failed');
    }
  } catch (error) {
    showToast('Error', 'Could not send message. Please check your internet or setup.', 'fa-exclamation-circle');
  } finally {
    submitBtn.classList.remove('btn-loading');
  }
}

/* ══════════════════════════════════════════
   3D TILT — Generic Tilt Cards (Contact, etc.)
   ══════════════════════════════════════════ */
document.querySelectorAll('.tilt-card').forEach(card => {
  let tiltTicking = false;
  card.addEventListener('mousemove', (e) => {
    if (!tiltTicking) {
      window.requestAnimationFrame(() => {
        applyTilt(card, e, { max: 4, perspective: 1000 });
        tiltTicking = false;
      });
      tiltTicking = true;
    }
  }, { passive: true });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
});

/* ══════════════════════════════════════════
   BIO-DATA MODAL
   ══════════════════════════════════════════ */
function openBioModal() {
  const overlay = document.getElementById('bio-overlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Scroll modal to top every open
  document.getElementById('bio-modal').scrollTop = 0;
}

function closeBioModal() {
  const overlay = document.getElementById('bio-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeBioOnOverlay(e) {
  if (e.target === document.getElementById('bio-overlay')) {
    closeBioModal();
  }
}

function printBio() {
  window.print();
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBioModal();
    closeResumeModal();
  }
});

/* ══════════════════════════════════════════
   RESUME MODAL
   ══════════════════════════════════════════ */
let resumeZoomLevel = 1;
const ZOOM_STEP = 0.2;
const ZOOM_MIN  = 0.5;
const ZOOM_MAX  = 3.0;

function _applyResumeZoom() {
  const img   = document.getElementById('resume-img');
  const label = document.getElementById('resume-zoom-label');
  if (!img) return;
  
  // Apply layout zoom so scrollbars appear
  img.style.width = (resumeZoomLevel * 100) + '%';
  img.style.maxWidth = 'none'; // Allow it to exceed container
  
  img.style.cursor = resumeZoomLevel > 1 ? 'zoom-out' : 'zoom-in';
  if (label) label.textContent = Math.round(resumeZoomLevel * 100) + '%';
}

function resumeZoomIn()    { resumeZoomLevel = Math.min(ZOOM_MAX, +(resumeZoomLevel + ZOOM_STEP).toFixed(1)); _applyResumeZoom(); }
function resumeZoomOut()   { resumeZoomLevel = Math.max(ZOOM_MIN, +(resumeZoomLevel - ZOOM_STEP).toFixed(1)); _applyResumeZoom(); }
function resumeZoomReset() { resumeZoomLevel = 1; _applyResumeZoom(); }

function openResumeModal() {
  const overlay = document.getElementById('resume-overlay');
  if (!overlay) return;
  resumeZoomReset(); // always start at 100%
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  const imgWrap = overlay.querySelector('.resume-img-wrap');
  if (imgWrap) imgWrap.scrollTop = 0;
}

function closeResumeModal() {
  const overlay = document.getElementById('resume-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeResumeOnOverlay(e) {
  if (e.target === document.getElementById('resume-overlay')) {
    closeResumeModal();
  }
}

function printResume() {
  window.print();
}

function printCert() {
  window.print();
}

/**
 * Robustly downloads a file from a URL by fetching it as a blob
 */
async function downloadFileFromUrl(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: try opening in new tab if fetch fails
    window.open(url, '_blank');
  }
}

function downloadResume() {
  const img = document.getElementById('resume-img');
  if (img && img.src) {
    downloadFileFromUrl(img.src, 'Aditya_Biswas_Resume.png');
  }
}

function downloadCert() {
  const img = document.getElementById('cert-viewer-img');
  if (img && img.src) {
    // Extract a filename from the URL or use a default
    const filename = 'Certificate_' + Date.now() + '.png';
    downloadFileFromUrl(img.src, filename);
  }
}

// Mouse wheel inside modal:
//   Plain scroll  → pan image up / down
//   Ctrl + scroll → zoom in / out
(function () {
  const wrap = document.getElementById('resume-img-wrap');
  if (!wrap) return;
  wrap.addEventListener('wheel', (e) => {
    const overlay = document.getElementById('resume-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;

    if (e.ctrlKey) {
      // Ctrl held → zoom
      e.preventDefault();
      e.deltaY < 0 ? resumeZoomIn() : resumeZoomOut();
    }
    // No ctrlKey → let the browser scroll the wrap naturally (no preventDefault)
  }, { passive: false });
})();


/* ══════════════════════════════════════════
   CERTIFICATES AUTO-SCROLL (Marquee)
   ══════════════════════════════════════════ */
(function initCertAutoScroll() {
  const certGrid = document.querySelector('.cert-grid');
  const wrap = document.querySelector('.cert-carousel-wrap');
  const prevBtn = document.getElementById('cert-prev');
  const nextBtn = document.getElementById('cert-next');

  if (!certGrid) return;

  // Clone all children to allow for seamless infinite scrolling
  const originalCards = Array.from(certGrid.children);
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    // Remove IDs if any existed to prevent duplicates
    clone.removeAttribute('id');
    certGrid.appendChild(clone);
  });

  let scrollPos = 0;
  let isPaused = false;
  let animationFrameId;
  const speed = 1.0; // smooth and readable speed
  let manualScrollTimeout;

  function scrollStep() {
    if (!isPaused) {
      scrollPos += speed;
      // If we've scrolled past the first half (the original set of cards), reset to 0 to loop smoothly
      if (scrollPos >= certGrid.scrollWidth / 2) {
        scrollPos = 0;
      }
      certGrid.scrollLeft = scrollPos;
    }
    animationFrameId = requestAnimationFrame(scrollStep);
  }

  // Pause scrolling on hover or touch anywhere on the carousel wrap
  if (wrap) {
    wrap.addEventListener('mouseenter', () => isPaused = true);
    wrap.addEventListener('mouseleave', () => {
      isPaused = false;
      // Sync internal position with actual scroll position in case user scrolled manually
      scrollPos = certGrid.scrollLeft;
    });
  } else {
    certGrid.addEventListener('mouseenter', () => isPaused = true);
    certGrid.addEventListener('mouseleave', () => {
      isPaused = false;
      scrollPos = certGrid.scrollLeft;
    });
  }
  
  certGrid.addEventListener('touchstart', () => isPaused = true, { passive: true });
  certGrid.addEventListener('touchend', () => {
    isPaused = false;
    scrollPos = certGrid.scrollLeft;
  }, { passive: true });

  // Sync scrollPos when user manually scrolls
  certGrid.addEventListener('scroll', () => {
    if (isPaused) {
      scrollPos = certGrid.scrollLeft;
    }
  }, { passive: true });

  // Button Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      isPaused = true;
      certGrid.scrollBy({ left: -380, behavior: 'smooth' });
      clearTimeout(manualScrollTimeout);
      manualScrollTimeout = setTimeout(() => { isPaused = false; scrollPos = certGrid.scrollLeft; }, 600);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      isPaused = true;
      certGrid.scrollBy({ left: 380, behavior: 'smooth' });
      clearTimeout(manualScrollTimeout);
      manualScrollTimeout = setTimeout(() => { isPaused = false; scrollPos = certGrid.scrollLeft; }, 600);
    });
  }

  // Start the loop
  animationFrameId = requestAnimationFrame(scrollStep);
})();

/* ══════════════════════════════════════════
   CERTIFICATE VIEWER LOGIC
   ══════════════════════════════════════════ */
function openCertViewer(imgUrl) {
  const overlay = document.getElementById('cert-viewer-overlay');
  const viewerImg = document.getElementById('cert-viewer-img');
  if (!overlay || !viewerImg) return;
  
  viewerImg.src = imgUrl;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCertViewer(e) {
  // Close if clicking overlay or close button, not the image itself
  if (e && e.target.closest('.cert-viewer-img-wrap')) return;
  
  const overlay = document.getElementById('cert-viewer-overlay');
  if (!overlay) return;
  
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close viewer on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const certOverlay = document.getElementById('cert-viewer-overlay');
    if (certOverlay && certOverlay.classList.contains('open')) {
      closeCertViewer();
    }
  }
});

// Intercept certificate link clicks for in-site viewing
document.addEventListener('click', (e) => {
  const link = e.target.closest('.cert-link');
  if (link) {
    const url = link.getAttribute('href');
    if (url && url !== '#') {
      // Check if URL is an image or Cloudinary link
      if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('cloudinary.com')) {
        e.preventDefault();
        openCertViewer(url);
      }
    }
  }
});
