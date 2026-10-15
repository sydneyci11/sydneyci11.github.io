// Native disclosures remain usable without JavaScript; enhance the desktop deck.
const projectDeck = document.querySelector('.project-deck');

if (projectDeck) {
  const cards = [...projectDeck.querySelectorAll('.project-card')];
  const desktop = window.matchMedia('(min-width: 901px)');
  const status = document.getElementById('project-deck-status');
  const chapter = projectDeck.closest('.side-project-chapter');
  const masthead = chapter.querySelector('.side-masthead');
  const navigation = document.querySelector('.site-nav');
  const choices = document.createElement('div');
  choices.className = 'deck-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', 'Choose a side project');
  const buttons = cards.map((card, index) => {
    card.id = `project-card-${index + 1}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'deck-choice';
    button.textContent = `${String(index + 1).padStart(2, '0')} / ${card.querySelector('.project-picker-title').textContent}`;
    button.setAttribute('aria-controls', card.id);
    button.addEventListener('click', () => {
      cards.forEach(other => { other.open = other === card; });
      announceSelection();
      updateHeight();
    });
    choices.append(button);
    return button;
  });
  projectDeck.before(choices);
  let sizingFrame = 0;
  let lastHeight = 0;

  const updateHeight = () => {
    cancelAnimationFrame(sizingFrame);
    sizingFrame = requestAnimationFrame(() => {
      if (!desktop.matches) {
        chapter.classList.remove('is-viewport-fit');
        projectDeck.style.removeProperty('--deck-panel-height');
        lastHeight = 0;
        return;
      }
      const compact = desktop.matches && window.innerHeight >= 650;
      chapter.classList.toggle('is-viewport-fit', compact);
      const selected = cards.find(card => card.open);
      if (!selected) return;
      // Place two exposed cards on each side of the drawn card, including when
      // the first or last project is selected. Spread into the available width.
      const remaining = cards.filter(card => card !== selected);
      const sideCount = Math.ceil(remaining.length / 2);
      const spacing = Math.max(0, (projectDeck.clientWidth - selected.offsetWidth - 48) / (2 * sideCount));
      remaining.forEach((card, index) => {
        const rank = index < sideCount ? index - sideCount : index - sideCount + 1;
        card.setAttribute('data-deck-side', rank < 0 ? 'left' : 'right');
        card.style.setProperty('--deck-exposed-width', `${spacing}px`);
        card.style.setProperty('--card-shift', `${rank * spacing}px`);
        card.style.setProperty('--card-angle', `${rank * 2}deg`);
        card.style.setProperty('--card-layer', String(5 - Math.abs(rank)));
      });
      selected.removeAttribute('data-deck-side');
      selected.style.setProperty('--card-shift', '0px');
      selected.style.setProperty('--card-angle', '0deg');
      const navHeight = navigation?.getBoundingClientRect().height || 0;
      const choiceStyle = window.getComputedStyle(choices);
      const choiceMargins = parseFloat(choiceStyle.marginTop) + parseFloat(choiceStyle.marginBottom);
      const chapterStyle = window.getComputedStyle(chapter);
      const available = Math.floor(window.innerHeight - navHeight - masthead.offsetHeight - choices.offsetHeight - choiceMargins - parseFloat(chapterStyle.paddingBottom) - 16);
      const fitted = compact && available >= 280;
      chapter.classList.toggle('is-viewport-fit', fitted);
      if (fitted) {
        cards.forEach(card => {
          card.style.setProperty('--deck-card-height', `${available - 32}px`);
          if (card.open) card.style.setProperty('--deck-summary-height', `${card.querySelector('summary').offsetHeight}px`);
        });
      }
      // Long descriptions scroll inside the drawn card; switching keeps the chapter steady.
      const height = fitted ? available : Math.max(600, Math.ceil(selected.offsetHeight + 100));
      if (height !== lastHeight) {
        projectDeck.style.setProperty('--deck-panel-height', `${height}px`);
        lastHeight = height;
      }
    });
  };

  const announceSelection = () => {
    const selected = cards.findIndex(card => card.open);
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === selected)));
    if (status) status.textContent = selected < 0
      ? `${String(cards.length).padStart(2, '0')} projects · Choose a title`
      : `${String(selected + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')} · Selected`;
  };

  cards.forEach((card, index) => {
    const summary = card.querySelector('summary');
    const panel = card.querySelector('.project-panel');
    panel.tabIndex = 0;
    summary.addEventListener('click', event => {
      // Keep a selected page visible on desktop; mobile can collapse every card.
      if (desktop.matches && card.open) event.preventDefault();
    });
    summary.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      let target;
      if (event.key === 'ArrowDown') target = (index + 1) % cards.length;
      if (event.key === 'ArrowUp') target = (index - 1 + cards.length) % cards.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = cards.length - 1;
      if (target !== undefined) {
        event.preventDefault();
        cards[target].querySelector('summary').focus();
      }
    });
    card.addEventListener('toggle', () => {
      if (card.open) cards.forEach(other => {
        if (other !== card) other.open = false;
      });
      announceSelection();
      updateHeight();
    });
  });

  const openHashTarget = () => {
    let target;
    try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); }
    catch { return; }
    const matching = cards.find(card => target && card.contains(target));
    if (!matching) return;
    cards.forEach(card => { card.open = card === matching; });
    announceSelection();
    updateHeight();
  };

  projectDeck.classList.add('is-enhanced');
  desktop.addEventListener('change', () => {
    if (desktop.matches && !cards.some(card => card.open)) cards[0].open = true;
    announceSelection();
    updateHeight();
  });
  window.addEventListener('resize', updateHeight);
  window.addEventListener('hashchange', openHashTarget);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(updateHeight);
    cards.forEach(card => {
      observer.observe(card);
      observer.observe(card.querySelector('summary'));
    });
    observer.observe(masthead);
    observer.observe(choices);
    if (navigation) observer.observe(navigation);
  }
  openHashTarget();
  announceSelection();
  updateHeight();
}
