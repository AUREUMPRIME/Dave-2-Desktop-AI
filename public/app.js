(() => {
  const s = {
    canvas: document.getElementById('dos-canvas'),
    ctx: null,
    img: document.createElement('canvas'),
    imgCtx: null,
    started: false,
    agentOn: false
  };

  // Canvas principal y offscreen 320x200
  s.ctx = s.canvas.getContext('2d', { willReadFrequently: true });
  s.ctx.imageSmoothingEnabled = false;
  s.img.width = 320; s.img.height = 200;
  s.imgCtx = s.img.getContext('2d', { willReadFrequently: true });

  const btnStart = document.getElementById('btn-start');
  const btnAgent = document.getElementById('btn-agent');
  const fpsEl    = document.getElementById('fps');
  const errEl    = document.getElementById('err');

  const log = (m) => console.log(m);
  const err = (m) => { console.error(m); errEl.textContent = String(m); };

  function fit() {
    s.canvas.width  = window.innerWidth|0;
    s.canvas.height = window.innerHeight|0;
  }
  window.addEventListener('resize', fit); fit();

  // DEBUG: texto para verificar que sí dibuja en canvas
  function drawDebug(msg) {
    s.ctx.fillStyle = '#0f0';
    s.ctx.font = '16px ui-monospace,monospace';
    s.ctx.fillText(msg, 20, 40);
  }
  drawDebug('DEBUG: canvas OK');

  // FPS básico
  let last = performance.now();
  (function loop(){
    const now = performance.now();
    const dt = now - last; last = now;
    fpsEl.textContent = 'FPS: ' + ((1000/dt)|0);
    requestAnimationFrame(loop);
  })();

  // Boot: carga bundle y conecta onFrame -> canvas
  async function boot() {
    try {
      if (s.started) { errEl.textContent = 'ya estaba iniciado'; return; }

      // js-dos v8 (worker) + rutas locales
      // emulators.js está incluido vía <script src="./vendor/jsdos/emulators/emulators.js">
      // y expone "emulators" en global.
      emulators.pathPrefix = './vendor/jsdos/emulators/';

      const resp = await fetch('./dave2.jsdos');
      if (!resp.ok) throw new Error('No encuentro dave2.jsdos');
      const bundle = new Uint8Array(await resp.arrayBuffer());

      const ci = await emulators.dosWorker(bundle);

      ci.events().onStdout((line) => log('[dos] ' + line));

      // Pintado de frames: rgb (3 canales) o rgba (4 canales)
      const tmp = new Uint8ClampedArray(320 * 200 * 4);
      let first = true;

      ci.events().onFrame((rgb, rgba) => {
        let imgData;
        if (rgba) {
          imgData = new ImageData(rgba, 320, 200);
        } else {
          // Convertir RGB -> RGBA
          for (let i = 0, j = 0; i < 320*200; i++, j += 4) {
            tmp[j]   = rgb[i*3];
            tmp[j+1] = rgb[i*3+1];
            tmp[j+2] = rgb[i*3+2];
            tmp[j+3] = 255;
          }
          imgData = new ImageData(tmp, 320, 200);
        }
        s.imgCtx.putImageData(imgData, 0, 0);

        // Escalar 320x200 a pantalla completa sin blur
        s.ctx.save();
        s.ctx.imageSmoothingEnabled = false;
        s.ctx.setTransform(s.canvas.width/320, 0, 0, s.canvas.height/200, 0, 0);
        s.ctx.drawImage(s.img, 0, 0);
        s.ctx.restore();

        if (first) { errEl.textContent = 'frame#1 dibujado'; first = false; }
      });

      s.started = true;
      btnStart.textContent = 'Iniciado';
      errEl.textContent = '';
    } catch (e) {
      err(e);
    }
  }

  // Teclas simples para el agente demo
  function key(code, type='keydown') {
    const ev = new KeyboardEvent(type, { key: code, code, bubbles: true });
    s.canvas.dispatchEvent(ev);
    if (type === 'keydown') setTimeout(() => key(code, 'keyup'), 40);
  }
  let t = 0;
  function agentTick(){
    if (!s.agentOn) return;
    t++; key('ArrowRight');
    if (t % 30 === 0) key('Space');
    requestAnimationFrame(agentTick);
  }

  btnStart.addEventListener('click', () => { boot(); s.canvas.focus(); });
  btnAgent.addEventListener('click', () => {
    s.agentOn = !s.agentOn;
    btnAgent.textContent = 'Agente: ' + (s.agentOn ? 'ON' : 'OFF');
    if (s.agentOn) agentTick();
    s.canvas.focus();
  });
})();
