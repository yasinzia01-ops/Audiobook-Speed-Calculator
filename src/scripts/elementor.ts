// Small replacements for the Elementor / Elementor Pro frontend JS the pages relied on.

const TABLET_MAX = 1024;

/* ---------- Mega menu (Elementor Pro "n-menu") ---------- */
function initMegaMenu(widget: HTMLElement) {
  const nav = widget.querySelector<HTMLElement>('.e-n-menu');
  const toggle = widget.querySelector<HTMLButtonElement>('.e-n-menu-toggle');
  if (!nav) return;

  const dropdownQuery = window.matchMedia(`(max-width: ${TABLET_MAX}px)`);
  const items = [...widget.querySelectorAll<HTMLElement>('.e-n-menu-item')];

  const setLayout = () => {
    nav.dataset.layout = dropdownQuery.matches ? 'dropdown' : 'horizontal';
    if (!dropdownQuery.matches) toggle?.setAttribute('aria-expanded', 'false');
    closeAll();
    stretch();
  };

  // Full-width dropdown content spans the viewport, like Elementor's "stretch" helper.
  const stretch = () => {
    const width = document.documentElement.clientWidth;
    const left = widget.getBoundingClientRect().left;
    widget.style.setProperty('--stretch-width', `${width}px`);
    widget.style.setProperty('--stretch-left', `${-left}px`);
    if (dropdownQuery.matches) {
      const top = nav.getBoundingClientRect().bottom;
      widget.style.setProperty('--n-menu-dropdown-content-box-height', `${window.innerHeight - top}px`);
    }
  };

  const setOpen = (item: HTMLElement, open: boolean) => {
    const button = item.querySelector<HTMLButtonElement>('.e-n-menu-dropdown-icon');
    const content = item.querySelector<HTMLElement>('.e-n-menu-content');
    if (!button || !content) return;
    button.setAttribute('aria-expanded', String(open));
    content.classList.toggle('e-active', open);
    content.firstElementChild?.classList.toggle('e-active', open);
  };

  const closeAll = (except?: HTMLElement) => items.forEach((i) => i !== except && setOpen(i, false));

  for (const item of items) {
    const button = item.querySelector<HTMLButtonElement>('.e-n-menu-dropdown-icon');
    if (!button) continue;
    const title = item.querySelector<HTMLElement>('.e-n-menu-title');
    const toggleItem = () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      closeAll(item);
      setOpen(item, open);
    };
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleItem();
    });
    title?.addEventListener('click', (e) => {
      if (e.target instanceof Element && e.target.closest('a')) return;
      toggleItem();
    });
    item.addEventListener('mouseenter', () => {
      if (dropdownQuery.matches) return;
      closeAll(item);
      setOpen(item, true);
    });
    item.addEventListener('mouseleave', () => {
      if (!dropdownQuery.matches) setOpen(item, false);
    });
  }

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    stretch();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
  document.addEventListener('click', (e) => {
    if (e.target instanceof Node && !widget.contains(e.target)) closeAll();
  });

  dropdownQuery.addEventListener('change', setLayout);
  window.addEventListener('resize', stretch, { passive: true });
  setLayout();
}

/* ---------- Nested accordion (native <details>, "one item open at a time") ---------- */
function initAccordion(widget: HTMLElement) {
  const items = [...widget.querySelectorAll<HTMLDetailsElement>(':scope .e-n-accordion-item')];
  for (const item of items) {
    const summary = item.querySelector('summary');
    item.addEventListener('toggle', () => {
      summary?.setAttribute('aria-expanded', String(item.open));
      if (!item.open) return;
      for (const other of items) if (other !== item && other.open) other.open = false;
    });
  }
}

/* ---------- Counter ---------- */
function initCounter(el: HTMLElement) {
  const to = Number(el.dataset.toValue ?? 0);
  const from = Number(el.dataset.fromValue ?? 0);
  const duration = Number(el.dataset.duration ?? 2000);
  const delimiter = el.dataset.delimiter ?? '';
  const decimals = (String(to).split('.')[1] || '').length;
  const format = (n: number) => {
    const [int, dec] = n.toFixed(decimals).split('.');
    const grouped = delimiter ? int.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter) : int;
    return dec ? `${grouped}.${dec}` : grouped;
  };

  const run = () => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Elementor uses jQuery's "swing" easing.
      const eased = 0.5 - Math.cos(t * Math.PI) / 2;
      el.textContent = format(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = format(to);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      run();
    }
  });
  io.observe(el);
}

document.querySelectorAll<HTMLElement>('.elementor-widget-n-menu').forEach(initMegaMenu);
document.querySelectorAll<HTMLElement>('.elementor-widget-n-accordion').forEach(initAccordion);
document.querySelectorAll<HTMLElement>('.elementor-counter-number').forEach(initCounter);
