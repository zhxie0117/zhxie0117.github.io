(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const themeButton = document.querySelector('#theme-toggle');
  const menuButton = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#primary-nav');
  const mobile = matchMedia('(max-width: 700px)');
  let paintBackground = () => {};

  function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    themeButton.querySelector('.theme-symbol').textContent = dark ? '☀' : '☾';
    themeButton.querySelector('.theme-label').textContent = dark ? 'Light' : 'Dark';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#101f1d' : '#f4f7f5';
    paintBackground();
  }
  setTheme(root.dataset.theme || 'light');
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('zx-theme', next); } catch (_) { /* Storage may be unavailable. */ }
  });

  function closeMenu() {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  function updateMenu() { menuButton.hidden = !mobile.matches; closeMenu(); }
  root.dataset.enhanced = 'true';
  updateMenu();
  mobile.addEventListener('change', updateMenu);
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation`);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-nav')) closeMenu(); });

  const buttons = [...document.querySelectorAll('[data-filter]')];
  const papers = [...document.querySelectorAll('[data-category]')];
  document.querySelector('.filter-bar').hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    papers.forEach(paper => {
      paper.hidden = button.dataset.filter !== 'all' && paper.dataset.category !== button.dataset.filter;
      if (!paper.hidden) count++;
    });
    document.querySelector('#result-count').textContent = `${count} publication${count === 1 ? '' : 's'}`;
  }));
  // Highlight the section currently being read, and update the reading progress bar.
  const sections = [...nav.querySelectorAll('a')].map(a => ({ a, section: document.querySelector(a.hash) }));
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const length = root.scrollHeight - innerHeight;
    document.querySelector('#progress').style.transform = `scaleX(${length > 0 ? scrollY / length : 0})`;
    let active = sections[0];
    sections.forEach(item => { if (item.section.getBoundingClientRect().top < 180) active = item; });
    sections.forEach(item => {
      item.a.classList.toggle('active', item === active);
      if (item === active) item.a.setAttribute('aria-current', 'location');
      else item.a.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  addEventListener('resize', updateScroll);
  updateScroll();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // Keep the native cursor. Cards pick up a soft light and a small perspective shift.
  document.querySelectorAll('.interactive-card').forEach(card => {
    let frame = 0;
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || reducedMotion.matches) return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--gx', `${x * 100}%`);
        card.style.setProperty('--gy', `${y * 100}%`);
        card.style.setProperty('--rx', `${(0.5 - y) * 2.2}deg`);
        card.style.setProperty('--ry', `${(x - 0.5) * 2.2}deg`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
    });
  });
  document.addEventListener('click', event => {
    if (reducedMotion.matches || !finePointer.matches || event.detail === 0) return;
    // Cap transient effects even during rapid clicks.
    if (document.querySelectorAll('.click-ring').length > 4) return;
    const ring = document.createElement('span');
    ring.className = 'click-ring'; ring.setAttribute('aria-hidden', 'true');
    ring.style.left = `${event.clientX}px`; ring.style.top = `${event.clientY}px`;
    document.body.append(ring); setTimeout(() => ring.remove(), 700);
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('span'); spark.className = 'click-spark';
      spark.setAttribute('aria-hidden', 'true');
      spark.style.left = `${event.clientX}px`; spark.style.top = `${event.clientY}px`;
      spark.style.setProperty('--dx', `${Math.cos(i * Math.PI / 3) * 30}px`);
      spark.style.setProperty('--dy', `${Math.sin(i * Math.PI / 3) * 30}px`);
      document.body.append(spark); setTimeout(() => spark.remove(), 650);
    }
  });

  // A sparse dot field reacts locally to the pointer; it stops rendering when idle.
  const canvas = document.querySelector('#particles');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0, height = 0, animation = 0, color;
  let pointer = { x: -999, y: -999 }, lastMove = 0;
  function draw(now = performance.now()) {
    animation = 0;
    ctx.clearRect(0, 0, width, height);
    const interactive = finePointer.matches && !reducedMotion.matches && !document.hidden;
    const strength = interactive ? Math.max(0, 1 - (now - lastMove) / 950) : 0;
    for (let x = 16; x < width; x += 32) {
      for (let y = 16; y < height; y += 32) {
        const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - distance / 145) * strength;
        const push = influence * 11;
        const px = x + (distance ? dx / distance * push : 0);
        const py = y + (distance ? dy / distance * push : 0);
        ctx.beginPath(); ctx.arc(px, py, .65 + influence, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${.14 + influence * .36})`; ctx.fill();
      }
    }
    if (strength > 0 && !document.hidden) animation = requestAnimationFrame(draw);
  }
  function repaint() {
    color = getComputedStyle(root).getPropertyValue('--grid').trim();
    if (!animation) animation = requestAnimationFrame(draw);
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); repaint();
  }
  paintBackground = repaint;
  addEventListener('resize', resize);
  addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches) return;
    pointer = { x: event.clientX, y: event.clientY }; lastMove = performance.now(); repaint();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(animation); animation = 0; }
    else { lastMove = 0; repaint(); }
  });
  reducedMotion.addEventListener('change', () => { lastMove = 0; repaint(); });
  resize();
})();
