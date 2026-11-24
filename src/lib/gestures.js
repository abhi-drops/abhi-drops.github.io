// Pointer gestures shared by the post modal and story viewer.

// Double tap / double click. Single taps still reach normal click handlers.
export function onDoubleTap(el, fn, delay = 300) {
  let lastTap = 0;
  el.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const now = Date.now();
    if (now - lastTap < delay) {
      lastTap = 0;
      fn(e);
    } else lastTap = now;
  });
}

// Horizontal / vertical swipes. handlers: { left, right, up, down }
export function onSwipe(el, handlers, threshold = 40) {
  let x0 = null;
  let y0 = null;
  el.addEventListener('pointerdown', (e) => {
    x0 = e.clientX;
    y0 = e.clientY;
  });
  el.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    x0 = y0 = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    handlers[dir]?.(e);
    el.dataset.swiped = '1'; // lets click handlers ignore the tap that ended a swipe
    setTimeout(() => delete el.dataset.swiped, 0);
  });
}

// Press-and-hold. Returns a function that tells whether the last press was a hold.
export function onHold(el, { start, end }, delay = 180) {
  let timer = null;
  let held = false;
  el.addEventListener('pointerdown', () => {
    held = false;
    timer = setTimeout(() => {
      held = true;
      start();
    }, delay);
  });
  const release = () => {
    clearTimeout(timer);
    if (held) end();
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('pointerleave', release);
  return () => held;
}
