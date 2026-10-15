// Hover wakes the orbit lights and a barely perceptible central-sphere parallax.
// The native details name groups the accordion; toggle also supports older browsers.
const featuredDisciplines = [...document.querySelectorAll('details[name="featured-disciplines"]')];
featuredDisciplines.forEach(discipline => {
  discipline.addEventListener('toggle', () => {
    if (!discipline.open) return;
    featuredDisciplines.forEach(other => {
      if (other !== discipline) other.open = false;
    });
  });
});

const orbitArtwork = document.querySelector('.hero-art');

if (orbitArtwork) {
  const rearLights = orbitArtwork.querySelector('.orbit-lights-rear');
  const frontLights = orbitArtwork.querySelector('.orbit-lights-front');
  const orbital = orbitArtwork.querySelector('.orbital');
  const sphereSheen = document.getElementById('sphere-sheen');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const satellites = [...orbitArtwork.querySelectorAll('.orbit-satellite')].map(group => ({
    dots: [...group.querySelectorAll('circle')].map(dot => ({
      element: dot,
      radius: Number(dot.getAttribute('r'))
    })),
    rx: Number(group.dataset.rx),
    ry: Number(group.dataset.ry),
    rotation: Number(group.dataset.rotation) * Math.PI / 180,
    period: Number(group.dataset.period) * 1000,
    phase: Number(group.dataset.phase)
  }));
  let frame = 0;
  let elapsed = 0;
  let previousTime = null;
  let shiftX = 0;
  let shiftY = 0;
  let sheenX = 214;
  let sheenY = 210;
  let targetSheenX = sheenX;
  let targetSheenY = sheenY;

  const updateSphereTarget = event => {
    const bounds = orbital.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    shiftX = (x - .5) * 3;
    shiftY = (y - .5) * 3;
    // Keep the small reflection on the sphere, even near the outer orbit.
    const dx = x * 480 - 240 - shiftX;
    const dy = y * 480 - 240 - shiftY;
    const distance = Math.hypot(dx, dy);
    const projection = distance > 68 ? 68 / distance : 1;
    targetSheenX = 240 + dx * projection;
    targetSheenY = 240 + dy * projection;
  };

  const positionLights = () => {
    satellites.forEach(orbit => {
      const angle = elapsed / orbit.period * Math.PI * 2 + orbit.phase;
      orbit.dots.forEach(({ element: dot, radius }, index) => {
        const trailAngle = angle - (orbit.dots.length - 1 - index) * .045;
        const x = orbit.rx * Math.cos(trailAngle);
        const y = orbit.ry * Math.sin(trailAngle);
        // Positive sine is the near semicircle, matching the SVG front paths.
        const depth = Math.sin(trailAngle);
        const layer = depth >= 0 ? frontLights : rearLights;
        if (dot.parentNode !== layer) layer.appendChild(dot);
        dot.setAttribute('cx', 240 + x * Math.cos(orbit.rotation) - y * Math.sin(orbit.rotation));
        dot.setAttribute('cy', 240 + x * Math.sin(orbit.rotation) + y * Math.cos(orbit.rotation));
        const trailOpacity = index === orbit.dots.length - 1 ? 1 : index === 0 ? .2 : .45;
        dot.setAttribute('opacity', trailOpacity * (.7 + depth * .3));
        dot.setAttribute('r', radius * (.9 + depth * .1));
      });
    });
  };

  const animateLights = time => {
    const delta = previousTime === null ? 16 : Math.min(time - previousTime, 50);
    elapsed += delta;
    previousTime = time;
    orbitArtwork.style.setProperty('--sphere-shift-x', `${shiftX}px`);
    orbitArtwork.style.setProperty('--sphere-shift-y', `${shiftY}px`);
    const smoothing = 1 - Math.exp(-delta / 85);
    sheenX += (targetSheenX - sheenX) * smoothing;
    sheenY += (targetSheenY - sheenY) * smoothing;
    sphereSheen.setAttribute('cx', sheenX);
    sphereSheen.setAttribute('cy', sheenY);
    positionLights();
    frame = requestAnimationFrame(animateLights);
  };

  const stopLights = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = null;
    orbitArtwork.classList.remove('is-interacting');
    shiftX = 0;
    shiftY = 0;
    orbitArtwork.style.removeProperty('--sphere-shift-x');
    orbitArtwork.style.removeProperty('--sphere-shift-y');
  };

  orbitArtwork.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches || !finePointer.matches || frame) return;
    updateSphereTarget(event);
    positionLights();
    orbitArtwork.classList.add('is-interacting');
    frame = requestAnimationFrame(animateLights);
  });
  orbitArtwork.addEventListener('pointermove', event => {
    if (frame && event.pointerType !== 'touch') updateSphereTarget(event);
  });
  orbitArtwork.addEventListener('pointerleave', stopLights);
  orbitArtwork.addEventListener('pointercancel', stopLights);
  window.addEventListener('blur', stopLights);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLights();
  });
  reducedMotion.addEventListener('change', stopLights);
  finePointer.addEventListener('change', stopLights);
}
