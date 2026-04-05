/**
 * testimonials.js
 * - Accessible carousel with auto-advance and keyboard controls
 * - Modal for hero expansion and video playback (lazy-loaded)
 * - Reduced-motion respect and graceful failure if elements missing
 *
 * Usage:
 * - Include with <script src="/assets/js/testimonials.js" defer></script>
 * - Markup must match classes used below (carousel-track, carousel-control, testimonial-card, etc.)
 */

(function () {
  'use strict';

  // Run after DOM parsed. If script is loaded with defer this will run after parsing.
  document.addEventListener('DOMContentLoaded', initTestimonials);

  function initTestimonials() {
    initCarousel();
    initHeroModal();
    attachLazyLoadHints();
  }

  /* -------------------------
     Carousel Implementation
     ------------------------- */
  function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const viewport = document.querySelector('.carousel-viewport');

    if (!track || !prevBtn || !nextBtn || !viewport) return;

    const slides = Array.from(track.children);
    if (slides.length === 0) return;

    // Compute slide width including gap. Fallback to bounding rect if gap unknown.
    const gap = getComputedStyle(track).gap ? parseInt(getComputedStyle(track).gap, 10) : 16;
    const slideWidth = slides[0].getBoundingClientRect().width + gap;

    let index = 0;
    let autoAdvance = true;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = prefersReduced ? 8000 : 5000;
    let timer = null;

    // Set initial aria-hidden attributes
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== index ? 'true' : 'false'));

    function update() {
      const x = -index * slideWidth;
      track.style.transform = `translateX(${x}px)`;
      slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== index ? 'true' : 'false'));
      // Manage focusability for accessibility
      slides.forEach((s, i) => {
        const focusables = s.querySelectorAll('a, button, input, [tabindex]');
        focusables.forEach(el => {
          if (i === index) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }

    prevBtn.addEventListener('click', () => { goTo(index - 1); resetTimer(); });
    nextBtn.addEventListener('click', () => { goTo(index + 1); resetTimer(); });

    // Pause on hover/focus for accessibility
    viewport.addEventListener('mouseenter', pauseAuto);
    viewport.addEventListener('mouseleave', resumeAuto);
    viewport.addEventListener('focusin', pauseAuto);
    viewport.addEventListener('focusout', resumeAuto);

    function startTimer() {
      if (!autoAdvance) return;
      timer = setInterval(() => goTo(index + 1), intervalMs);
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      startTimer();
    }

    function pauseAuto() {
      autoAdvance = false;
      if (timer) clearInterval(timer);
    }

    function resumeAuto() {
      autoAdvance = true;
      resetTimer();
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { goTo(index - 1); resetTimer(); }
      if (e.key === 'ArrowRight') { goTo(index + 1); resetTimer(); }
    });

    // Resize handling to recalc slide width
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Recompute slide width
        const newSlideWidth = slides[0].getBoundingClientRect().width + gap;
        // Only update transform if changed
        if (Math.abs(newSlideWidth - slideWidth) > 1) update();
      }, 150);
    });

    // Initialize
    update();
    startTimer();
  }

  /* -------------------------
     Hero Modal and Video Lazy Load
     ------------------------- */
  function initHeroModal() {
    // Elements expected in markup
    const heroLinks = document.querySelectorAll('[data-testimonial-modal]');
    if (!heroLinks || heroLinks.length === 0) return;

    // Create modal shell once
    const modal = createModalShell();
    document.body.appendChild(modal.overlay);

    heroLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const contentType = link.getAttribute('data-modal-type') || 'text';
        const src = link.getAttribute('href') || link.getAttribute('data-src');
        openModal(modal, { type: contentType, src, trigger: link });
      });
    });

    // Close handlers
    modal.closeBtn.addEventListener('click', () => closeModal(modal));
    modal.overlay.addEventListener('click', (ev) => {
      if (ev.target === modal.overlay) closeModal(modal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.overlay.classList.contains('open')) closeModal(modal);
    });
  }

  function createModalShell() {
    const overlay = document.createElement('div');
    overlay.className = 'testimonial-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;z-index:3000;visibility:hidden;opacity:0;transition:opacity .25s ease';

    const dialog = document.createElement('div');
    dialog.className = 'testimonial-modal';
    dialog.style.cssText = 'max-width:900px;width:100%;background:rgba(5,8,20,0.98);border-radius:12px;padding:18px;box-shadow:0 10px 40px rgba(0,0,0,0.6);color:#fff;';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.setAttribute('aria-label', 'Close testimonial');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = 'min-height:120px;';

    dialog.appendChild(closeBtn);
    dialog.appendChild(content);
    overlay.appendChild(dialog);

    // Methods to open/close
    overlay.open = function () {
      overlay.style.visibility = 'visible';
      overlay.style.opacity = '1';
      overlay.classList.add('open');
      // trap focus
      dialog.setAttribute('tabindex', '-1');
      dialog.focus();
    };

    overlay.close = function () {
      overlay.style.opacity = '0';
      overlay.classList.remove('open');
      setTimeout(() => { overlay.style.visibility = 'hidden'; }, 260);
    };

    return { overlay, dialog, content, closeBtn };
  }

  function openModal(modal, opts) {
    // opts: { type: 'video'|'text', src: 'url', trigger: element }
    const { overlay, content } = modal;
    // Clear previous content
    content.innerHTML = '';

    if (opts.type === 'video' && opts.src) {
      // Lazy create video element or iframe
      const isYouTube = /youtube\.com|youtu\.be/.test(opts.src);
      if (isYouTube) {
        const iframe = document.createElement('iframe');
        iframe.src = buildYouTubeEmbed(opts.src);
        iframe.width = '100%';
        iframe.height = '480';
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.border = '0';
        content.appendChild(iframe);
      } else {
        const video = document.createElement('video');
        video.controls = true;
        video.src = opts.src;
        video.style.width = '100%';
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'none');
        content.appendChild(video);
        // Autoplay only if user interacted
        setTimeout(() => { try { video.play(); } catch (e) {} }, 250);
      }
    } else if (opts.type === 'text' && opts.src) {
      // Fetch expanded testimonial HTML fragment if provided
      fetch(opts.src, { credentials: 'same-origin' })
        .then(r => r.text())
        .then(html => { content.innerHTML = html; })
        .catch(() => { content.innerHTML = '<p>Unable to load content.</p>'; });
    } else {
      // Generic fallback: clone nearby expanded content if data-target provided
      const fallback = opts.trigger && document.querySelector(opts.trigger.getAttribute('data-target'));
      if (fallback) content.appendChild(fallback.cloneNode(true));
      else content.innerHTML = '<p>Expanded testimonial content not available.</p>';
    }

    overlay.open();
  }

  function closeModal(modal) {
    // Stop any playing media inside modal
    const media = modal.content.querySelectorAll('video, iframe');
    media.forEach(m => {
      try {
        if (m.tagName.toLowerCase() === 'video') { m.pause(); m.currentTime = 0; }
        if (m.tagName.toLowerCase() === 'iframe') { m.src = ''; }
      } catch (e) {}
    });
    modal.overlay.close();
  }

  function buildYouTubeEmbed(url) {
    // Convert watch URL to embed URL
    try {
      const u = new URL(url, location.href);
      let id = u.searchParams.get('v');
      if (!id && u.hostname === 'youtu.be') id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}?rel=0&autoplay=1` : url;
    } catch (e) {
      return url;
    }
  }

  /* -------------------------
     Lazy load hints and helpers
     ------------------------- */
  function attachLazyLoadHints() {
    // Add loading="lazy" to testimonial images if not present
    const imgs = document.querySelectorAll('.testimonial-thumb img, .testimonial-headshot, .media-thumb img, .client-logo');
    imgs.forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });

    // Defer heavy video players by replacing links with data-src until clicked
    const videoLinks = document.querySelectorAll('a[data-modal-type="video"]');
    videoLinks.forEach(a => {
      const href = a.getAttribute('href');
      if (href && !a.hasAttribute('data-src')) {
        a.setAttribute('data-src', href);
        a.removeAttribute('href');
        a.setAttribute('href', '#');
      }
    });
  }

})();
