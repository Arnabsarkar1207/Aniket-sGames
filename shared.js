// Shared helpers: sounds, particles, press-and-hold buttons.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- sound (plain <audio> so the iPhone silent switch doesn't mute it) ----------
  const clips = {};
  let playing = null;
  function clip(name) {
    if (!clips[name]) {
      const a = new Audio('sounds/' + name + '.mp3');
      a.preload = 'auto';
      clips[name] = a;
    }
    return clips[name];
  }
  function play(name) {
    stop();
    const a = clip(name);
    try { a.currentTime = 0; } catch (e) {}
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    playing = a;
    return a;
  }
  function stop() { if (playing) { try { playing.pause(); } catch (e) {} playing = null; } }
  function preload(names) { names.forEach(n => clip(n).load()); }

  function speak(text) {
    try {
      if (!text || !('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.8; u.pitch = 1.25;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---------- particles ----------
  function burst(x, y, chars, n) {
    if (reduce) n = Math.min(n, 4);
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'fx';
      el.textContent = chars[Math.floor(Math.random() * chars.length)];
      const size = 22 + Math.random() * 30;
      el.style.fontSize = size + 'px';
      document.body.appendChild(el);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const dist = 90 + Math.random() * 150;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
      const rot = (Math.random() - 0.5) * 120;
      const a = el.animate([
        { transform: `translate(${x - size / 2}px, ${y - size / 2}px) scale(.3) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x - size / 2 + dx}px, ${y - size / 2 + dy}px) scale(1.15) rotate(${rot}deg)`, opacity: 1, offset: .55 },
        { transform: `translate(${x - size / 2 + dx * 1.15}px, ${y - size / 2 + dy + 70}px) scale(.8) rotate(${rot * 1.3}deg)`, opacity: 0 }
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' });
      a.onfinish = () => el.remove();
    }
  }
  // expanding ring ("sound wave") centred on an element
  function pulse(target, count) {
    if (reduce) return;
    const r = target.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, base = Math.min(r.width, r.height) * 0.55;
    for (let i = 0; i < (count || 3); i++) {
      const el = document.createElement('div');
      el.className = 'ring';
      el.style.cssText = `left:${cx - base}px;top:${cy - base}px;width:${base * 2}px;height:${base * 2}px`;
      document.body.appendChild(el);
      const a = el.animate([
        { transform: 'scale(.6)', opacity: .9 },
        { transform: 'scale(1.9)', opacity: 0 }
      ], { duration: 900, delay: i * 180, easing: 'ease-out', fill: 'backwards' });
      a.onfinish = () => el.remove();
    }
  }

  // ---------- press-and-hold button (a ring fills while held) ----------
  function holdButton(opts) {
    // opts: { emoji, side:'left'|'right', small, label, hint, ms, onDone }
    const ms = opts.ms || 800;
    const b = document.createElement('button');
    b.className = 'holdbtn ' + (opts.side || 'left') + (opts.small ? ' small' : '');
    b.style.setProperty('--hold', ms + 'ms');
    b.setAttribute('aria-label', opts.label);
    b.innerHTML = `<svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" pathLength="100"/></svg>${opts.emoji}`;
    const hint = document.createElement('div');
    hint.className = 'holdhint ' + (opts.side || 'left');
    hint.textContent = opts.hint;
    document.body.append(b, hint);

    let t = null, hintT = null;
    function cancel() { clearTimeout(t); t = null; b.classList.remove('holding'); }
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch (err) {}
      b.classList.remove('holding'); void b.offsetWidth; b.classList.add('holding');
      clearTimeout(t);
      t = setTimeout(() => { cancel(); opts.onDone(); }, ms);
    });
    b.addEventListener('pointerup', () => {
      if (t) {  // released early: show how to use it
        cancel();
        hint.classList.add('show'); clearTimeout(hintT);
        hintT = setTimeout(() => hint.classList.remove('show'), 1800);
      }
    });
    b.addEventListener('pointercancel', cancel);
    b.addEventListener('contextmenu', e => e.preventDefault());
    return b;
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }

  window.TG = { play, stop, preload, speak, burst, pulse, holdButton, registerSW };
})();
