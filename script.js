const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const yearEl = document.querySelector('#year');
const contactForm = document.querySelector('.contact-form');
const revealItems = document.querySelectorAll('.reveal');
const statItems = document.querySelectorAll('[data-target]');
const networkCanvas = document.querySelector('.network-canvas');

if (networkCanvas instanceof HTMLCanvasElement) {
  const hero = networkCanvas.closest('.hero');
  const context = networkCanvas.getContext('2d');

  if (hero && context) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: -1000, y: -1000 };
    let nodes = [];
    let frameId = 0;
    let isVisible = false;

    const resizeCanvas = () => {
      const bounds = hero.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      networkCanvas.width = Math.round(bounds.width * pixelRatio);
      networkCanvas.height = Math.round(bounds.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const count = Math.max(24, Math.min(65, Math.round((bounds.width * bounds.height) / 14000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));

      if (reducedMotion) drawNetwork(false);
    };

    const drawNetwork = (animate) => {
      const bounds = hero.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      context.clearRect(0, 0, width, height);

      nodes.forEach((node, index) => {
        if (animate) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;

          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 120 && distance > 0) {
            node.x -= (dx / distance) * 0.45;
            node.y -= (dy / distance) * 0.45;
          }
        }

        context.beginPath();
        context.arc(node.x, node.y, 2, 0, Math.PI * 2);
        context.fillStyle = 'rgba(125, 88, 69, 0.38)';
        context.fill();

        for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
          const other = nodes[otherIndex];
          const distance = Math.hypot(node.x - other.x, node.y - other.y);
          if (distance < 125) {
            context.beginPath();
            context.moveTo(node.x, node.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(125, 88, 69, ${(1 - distance / 125) * 0.16})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      });

      if (animate && isVisible) frameId = requestAnimationFrame(() => drawNetwork(true));
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      cancelAnimationFrame(frameId);
      if (isVisible && !reducedMotion) drawNetwork(true);
    });

    visibilityObserver.observe(hero);
    hero.addEventListener('pointermove', (event) => {
      if (reducedMotion || event.pointerType === 'touch') return;
      const bounds = hero.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
    });
    hero.addEventListener('pointerleave', () => {
      pointer.x = -1000;
      pointer.y = -1000;
    });
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

statItems.forEach((item) => {
  const target = Number(item.dataset.target || 0);
  const suffix = item.dataset.suffix || '';
  const duration = 1200;
  let startTime = null;

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const currentValue = Math.round(progress * target);
    item.textContent = currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(animate);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(item);
});

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button');

    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Wysłano!';
      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        contactForm.reset();
      }, 2000);
    }
  });
}
