// All pages share the same footer and loading behavior.
async function loadFooter() {
  const container = document.getElementById('footer');
  if (!container) return;

  try {
    const response = await fetch('footer.html');
    if (!response.ok) throw new Error(`Footer request failed: ${response.status}`);
    container.innerHTML = await response.text();
    const year = container.querySelector('[data-current-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  } catch (error) {
    console.error('Unable to load the shared footer.', error);
    const footer = document.createElement('footer');
    const link = document.createElement('a');
    link.href = 'footer.html';
    link.textContent = 'Contact details & resume';
    footer.append(link);
    container.replaceChildren(footer);
  }
}

loadFooter();

// Subtract the actual navigation height so the homepage fills one viewport.
if (document.body.classList.contains('home')) {
  const navigation = document.querySelector('nav');
  if (navigation) {
    const updateNavigationHeight = () => {
      document.body.style.setProperty('--home-nav-height', `${navigation.getBoundingClientRect().height}px`);
    };
    updateNavigationHeight();
    if ('ResizeObserver' in window) {
      new ResizeObserver(updateNavigationHeight).observe(navigation);
    } else {
      window.addEventListener('resize', updateNavigationHeight);
    }
  }
}
