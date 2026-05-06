/* ----------------------------------------------------------------
   Clipboard (copy code blocks)
   ---------------------------------------------------------------- */
document.querySelectorAll('.code-copy').forEach(button => {
  button.addEventListener('click', () => {
    const block = button.closest('.code-block');
    const text = block?.querySelector('code')?.textContent
      || block?.querySelector('pre')?.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      button.classList.add('is-copied');
      setTimeout(() => {
        button.classList.remove('is-copied');
      }, 2000);
    });
  });
});



/* ----------------------------------------------------------------
   TOC - IntersectionObserver scroll spy
   ---------------------------------------------------------------- */
const tocLinks = document.querySelectorAll('.page-toc .links a');
if (tocLinks.length > 0) {
  const tocTargetIds = new Set(
    [...tocLinks]
      .map(link => link.getAttribute('href'))
      .filter(href => href?.startsWith('#'))
      .map(href => href.slice(1))
  );
  const headingTargets = [...document.querySelectorAll('.page-content .heading-target[id]')]
    .filter(target => tocTargetIds.has(target.id));
  let rafId = null;
  const scrollOffset = 112;

  const getDocumentTop = (element) => {
    let top = 0;
    let current = element;

    while (current) {
      top += current.offsetTop;
      current = current.offsetParent;
    }

    return top;
  };

  const updateActiveTocLink = () => {
    rafId = null;
    if (headingTargets.length === 0) return;

    let current = headingTargets[0];

    for (const target of headingTargets) {
      if (target.getBoundingClientRect().top <= scrollOffset) {
        current = target;
        continue;
      }
      break;
    }

    tocLinks.forEach(l => l.classList.remove('active'));
    const match = document.querySelector(`.page-toc a[href="#${CSS.escape(current.id)}"]`);
    if (match) match.classList.add('active');
  };

  const scheduleTocUpdate = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(updateActiveTocLink);
  };

  window.addEventListener('scroll', scheduleTocUpdate, { passive: true });
  window.addEventListener('resize', scheduleTocUpdate);
  window.addEventListener('hashchange', scheduleTocUpdate);
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top = Math.max(0, getDocumentTop(target) - scrollOffset);
      history.pushState(null, '', href);
      window.scrollTo({ top, behavior: 'smooth' });
      scheduleTocUpdate();
    });
  });
  scheduleTocUpdate();
}

/* ----------------------------------------------------------------
   Feature cards - scroll-triggered stagger reveal
   ---------------------------------------------------------------- */
const featureCards = document.querySelectorAll('.landing-grid .landing-card');
if (featureCards.length > 0) {
  const cardObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      cardObserver.unobserve(entry.target);
    }
  }, { threshold: 0.1 });
  featureCards.forEach(c => cardObserver.observe(c));
}

/* ----------------------------------------------------------------
   Snap scroll hints - scrollIntoView so scroll lands on snap element
   ---------------------------------------------------------------- */
document.querySelectorAll('[data-scroll-to]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ----------------------------------------------------------------
   Theme toggle
   ---------------------------------------------------------------- */
window.toggleTheme = function () {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  html.classList.toggle('dark', !isDark);
  html.classList.toggle('light', isDark);
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
};

/* ----------------------------------------------------------------
   Mobile nav toggle
   ---------------------------------------------------------------- */
window.toggleNav = function () {
  const html = document.documentElement;
  const isOpen = html.classList.toggle('nav-open');
  const navToggle = document.querySelector('.nav-toggle');
  navToggle?.setAttribute('aria-expanded', String(isOpen));
  navToggle?.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
};

document.addEventListener('click', (e) => {
  if (!document.documentElement.classList.contains('nav-open')) return;
  if (!e.target.closest('.sidebar') && !e.target.closest('.nav-toggle')) {
    document.documentElement.classList.remove('nav-open');
    const navToggle = document.querySelector('.nav-toggle');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
  }
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.sidebar a')) {
    document.documentElement.classList.remove('nav-open');
    const navToggle = document.querySelector('.nav-toggle');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !document.documentElement.classList.contains('nav-open')) return;
  document.documentElement.classList.remove('nav-open');
  const navToggle = document.querySelector('.nav-toggle');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Open navigation');
  navToggle?.focus();
});
