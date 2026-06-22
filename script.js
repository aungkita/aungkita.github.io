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
      const startPos = window.scrollY;
      const duration = 900;
      const startTime = performance.now();
      const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const animateScroll = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startPos * (1 - eased));
        if (progress < 1) requestAnimationFrame(animateScroll);
      };
      requestAnimationFrame(animateScroll);
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

  /* ---------- Particle network (dark mode background) ---------- */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;
    let mouseX = -1000, mouseY = -1000;

    const PARTICLE_COLOR = 'rgba(212, 165, 116, ';   // warm gold (var(--accent) dark)
    const LINE_COLOR = 'rgba(212, 165, 116, ';
    const PARTICLE_RADIUS = 2;
    const CONNECT_DISTANCE = 130;
    const PARTICLE_COUNT_RATIO = 9000; // 1 particle per ~9000 px²

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const count = Math.min(90, Math.floor((canvas.width * canvas.height) / PARTICLE_COUNT_RATIO));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: PARTICLE_RADIUS + Math.random()
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse repulsion (subtle)
        const dxm = p.x - mouseX;
        const dym = p.y - mouseY;
        const distM = Math.sqrt(dxm * dxm + dym * dym);
        if (distM < 120) {
          const force = (120 - distM) / 120;
          p.x += (dxm / distM) * force * 1.5;
          p.y += (dym / distM) * force * 1.5;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_COLOR + '0.7)';
        ctx.fill();

        // Connect to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DISTANCE) {
            const opacity = (1 - dist / CONNECT_DISTANCE) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = LINE_COLOR + opacity + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(drawParticles);
    };

    const startParticles = () => {
      if (animationId) return;
      resizeCanvas();
      createParticles();
      drawParticles();
    };

    const stopParticles = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Observe theme changes on <html> to start/stop particles
    const observer = new MutationObserver(() => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) startParticles();
      else stopParticles();
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    // Init based on current theme
    if (root.getAttribute('data-theme') === 'dark') startParticles();

    // Resize handler
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (!animationId) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        createParticles();
      }, 200);
    });

    // Track mouse for subtle interaction
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });
  }

})();
