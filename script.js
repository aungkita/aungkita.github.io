/* ==========================================================
   Aungkita Saha — Academic Portfolio
   Interactivity: nav, scroll reveal, back-to-top progress
   ========================================================== */

(function () {
  'use strict';

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close mobile menu on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Back to top with progress ring ---------- */
  const toTop = document.getElementById('toTop');
  const ring = toTop ? toTop.querySelector('.progress-ring circle') : null;
  const circumference = ring ? 2 * Math.PI * 22 : 0;

  const updateTopButton = () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? scrolled / max : 0;

    if (scrolled > 400) toTop.classList.add('show');
    else toTop.classList.remove('show');

    if (ring) {
      const offset = circumference * (1 - progress);
      ring.style.strokeDashoffset = offset;
    }
  };
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Smooth scroll for in-page links (fallback) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const offset = 70;
          const y = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- Subtle parallax for portrait ---------- */
  const portrait = document.querySelector('.portrait-ring');
  if (portrait && window.matchMedia('(min-width: 961px)').matches) {
    let raf = null;
    window.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 12;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        portrait.style.translate = `${x}px ${y}px`;
      });
    });
  }

  /* ---------- Dhaka time (always UTC+6) ---------- */
  const dhakaTimeEl = document.getElementById('dhakaTime');
  const formatDhakaTime = (date) => {
    // Use Intl with explicit timeZone to be DST-safe
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    return fmt.format(date);
  };
  const tickDhakaClock = () => {
    if (!dhakaTimeEl) return;
    dhakaTimeEl.textContent = formatDhakaTime(new Date());
  };
  tickDhakaClock();
  setInterval(tickDhakaClock, 1000);

  /* ---------- Theme: light / dark / auto (Dhaka time) ---------- */
  const THEME_KEY = 'aungkita-theme';     // 'light' | 'dark' | 'auto'
  const themeButtons = document.querySelectorAll('.theme-btn');
  const root = document.documentElement;

  // Dhaka hour in 0..23
  const dhakaHour = (date) => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka', hour: '2-digit', hour12: false
    });
    const parts = fmt.formatToParts(date);
    const hourPart = parts.find(p => p.type === 'hour');
    return parseInt(hourPart.value, 10);
  };

  // Decide dark vs light from Dhaka local time
  // Dark: 19:00 – 06:00 (covers evening/night) ; Light: 06:00 – 19:00
  const isDhakaNight = (date) => {
    const h = dhakaHour(date);
    return h >= 19 || h < 6;
  };

  const applyTheme = (choice) => {
    let resolved;
    if (choice === 'auto') {
      resolved = isDhakaNight(new Date()) ? 'dark' : 'light';
    } else {
      resolved = choice;
    }
    root.setAttribute('data-theme', resolved);
    // Update button active states
    themeButtons.forEach(b => {
      b.classList.toggle('is-active', b.dataset.themeChoice === choice);
    });
  };

  // Init from storage (default: auto)
  let storedChoice = 'auto';
  try {
    storedChoice = localStorage.getItem(THEME_KEY) || 'auto';
  } catch (e) { /* private mode etc */ }
  applyTheme(storedChoice);

  // Button click handlers
  themeButtons.forEach(b => {
    b.addEventListener('click', () => {
      const choice = b.dataset.themeChoice; // 'auto' | 'light' | 'dark'
      try { localStorage.setItem(THEME_KEY, choice); } catch (e) {}
      applyTheme(choice);
    });
  });

  // While in 'auto' mode, re-evaluate every minute so the theme
  // flips at the right Dhaka-local sunrise/sunset time.
  setInterval(() => {
    try {
      const current = localStorage.getItem(THEME_KEY) || 'auto';
      if (current === 'auto') applyTheme('auto');
    } catch (e) {}
  }, 60 * 1000);

})();
