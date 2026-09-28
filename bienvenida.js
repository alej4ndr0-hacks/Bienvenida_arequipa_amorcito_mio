/* =========================================================
   Arequipa te estaba esperando ♡
   ========================================================= */

/* ---------------------------------------------------------
   1 · CUENTA REGRESIVA REAL
   Cambia aquí la fecha y hora de la llegada.
   Formato: AAAA-MM-DDThh:mm:ss  +  zona horaria de Perú (-05:00)
--------------------------------------------------------- */
const FECHA_LLEGADA = new Date('2026-10-01T12:00:00-05:00');

(function cuentaRegresiva () {
  const el = {
    d: document.getElementById('cd-d'),
    h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'),
    s: document.getElementById('cd-s'),
    msg: document.getElementById('cd-msg')
  };
  const dos = n => String(n).padStart(2, '0');
  const poner = (nodo, valor) => { if (nodo.textContent !== valor) nodo.textContent = valor; };

  let timer;
  function tick () {
    const falta = FECHA_LLEGADA.getTime() - Date.now();

    if (falta <= 0) {
      poner(el.d, '00'); poner(el.h, '00'); poner(el.m, '00'); poner(el.s, '00');
      el.msg.textContent = '¡Por fin en casa!';
      clearInterval(timer);
      return;
    }

    const total = Math.floor(falta / 1000);
    poner(el.d, dos(Math.floor(total / 86400)));
    poner(el.h, dos(Math.floor((total % 86400) / 3600)));
    poner(el.m, dos(Math.floor((total % 3600) / 60)));
    poner(el.s, dos(total % 60));
  }

  tick();
  timer = setInterval(tick, 250);
})();


/* ---------------------------------------------------------
   2 · MÚSICA DE FONDO
   Los navegadores bloquean el sonido automático: se intenta
   al cargar y, si no se puede, arranca con el primer toque o
   clic. El botón de abajo permite pausar / reanudar.
--------------------------------------------------------- */
(function musica () {
  const audio = document.getElementById('musica');
  const boton = document.getElementById('btn-musica');
  const icono = document.getElementById('music-ico');
  const VOLUMEN = 0.6;

  let pausadaPorUsuario = false;
  let fade;

  function mostrarEstado () {
    const sonando = !audio.paused;
    boton.classList.toggle('is-on', sonando);
    boton.setAttribute('aria-pressed', String(sonando));
    boton.setAttribute('aria-label', sonando ? 'Pausar música' : 'Activar música');
    icono.setAttribute('href', sonando ? '#i-sound' : '#i-mute');
  }

  function subirVolumen () {
    clearInterval(fade);
    audio.volume = 0;
    fade = setInterval(() => {
      audio.volume = Math.min(audio.volume + 0.03, VOLUMEN);
      if (audio.volume >= VOLUMEN) clearInterval(fade);
    }, 120);
  }

  function reproducir () {
    return audio.play().then(() => { subirVolumen(); mostrarEstado(); }).catch(() => mostrarEstado());
  }

  function primerToque (e) {
    if (pausadaPorUsuario || !audio.paused) return;
    if (boton.contains(e.target)) return;
    reproducir().then(() => { if (!audio.paused) quitarEscuchas(); });
  }

  const eventos = ['pointerdown', 'touchend', 'keydown', 'click'];
  const quitarEscuchas = () => eventos.forEach(ev => window.removeEventListener(ev, primerToque));
  eventos.forEach(ev => window.addEventListener(ev, primerToque));

  boton.addEventListener('click', () => {
    if (audio.paused) { pausadaPorUsuario = false; reproducir(); }
    else { pausadaPorUsuario = true; audio.pause(); mostrarEstado(); }
  });

  audio.addEventListener('play', mostrarEstado);
  audio.addEventListener('pause', mostrarEstado);

  audio.volume = VOLUMEN;
  reproducir();          // intento de reproducción automática
  mostrarEstado();
})();


/* ---------------------------------------------------------
   3 · BRISA SUAVE
   Ráfagas de viento muy tenues y pétalos que cruzan la
   pantalla despacito (se desactiva si el dispositivo pide
   "reducir movimiento").
--------------------------------------------------------- */
(function brisa () {
  const canvas = document.getElementById('brisa');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function ajustar () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  ajustar();
  window.addEventListener('resize', ajustar);

  const azar = (a, b) => a + Math.random() * (b - a);
  const movil = W < 700;

  function nuevaRafaga (inicial) {
    return {
      x: inicial ? azar(-200, W) : azar(-380, -60),
      y: azar(0, H),
      largo: azar(150, 330),
      vel: azar(1.1, 2.3),
      onda: azar(6, 16),
      fase: azar(0, 6.28),
      edad: inicial ? azar(0, 1) : 0,
      vida: azar(0.0022, 0.0042)
    };
  }
  const rafagas = Array.from({ length: movil ? 6 : 11 }, () => nuevaRafaga(true));

  const colores = ['rgba(255,204,214,.6)', 'rgba(255,230,220,.6)', 'rgba(250,170,150,.5)'];
  function nuevoPetalo (inicial) {
    return {
      x: inicial ? azar(0, W) : azar(-40, -10),
      y: azar(-20, H * 0.85),
      r: azar(3.6, 6.4),
      vx: azar(0.35, 0.85),
      vy: azar(0.08, 0.28),
      ang: azar(0, 6.28),
      giro: azar(-0.02, 0.03),
      fase: azar(0, 6.28),
      color: colores[Math.floor(Math.random() * colores.length)]
    };
  }
  const petalos = Array.from({ length: movil ? 7 : 14 }, () => nuevoPetalo(true));

  function dibujar (t) {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < rafagas.length; i++) {
      const r = rafagas[i];
      r.x += r.vel;
      r.edad += r.vida;
      if (r.edad >= 1 || r.x > W + 40) { rafagas[i] = nuevaRafaga(false); continue; }

      const alfa = Math.sin(Math.PI * r.edad) * 0.22;
      ctx.beginPath();
      for (let k = 0; k <= 14; k++) {
        const p = k / 14;
        const px = r.x + p * r.largo;
        const py = r.y + Math.sin(p * 4 + r.fase + t * 0.0008) * r.onda;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(255,255,255,' + alfa.toFixed(3) + ')';
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    for (const p of petalos) {
      p.x += p.vx + Math.sin(t * 0.0012 + p.fase) * 0.35;
      p.y += p.vy + Math.cos(t * 0.0009 + p.fase) * 0.22;
      p.ang += p.giro;
      if (p.x > W + 20 || p.y > H + 20) Object.assign(p, nuevoPetalo(false));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.ang);
      ctx.scale(1, 0.58);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(dibujar);
  }
  requestAnimationFrame(dibujar);
})();
