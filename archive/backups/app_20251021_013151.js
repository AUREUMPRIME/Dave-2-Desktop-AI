(() => {
  const $ = (s) => document.querySelector(s);
  const screen = $("#screen");
  const start  = $("#btn-start");
  const fpsEl  = $("#fps");

  let ci = null;

  async function boot() {
    try {
      // Rutas correctas para v8: el emulador vive en /vendor/jsdos/emulators/
      ci = await window.Dos(screen, {
        pathPrefix: "vendor/jsdos",
        wdosboxUrl: "vendor/jsdos/emulators/wdosbox.js"
      });

      // Cargar el paquete .jsdos directamente
      if (ci.run) {
        await ci.run("dave2.jsdos");
      } else {
        // Fallback por si la build expone API antigua
        await ci.ready;
        await ci.fs.extract("dave2.jsdos");
        await ci.main(["-c", "DAVE2.EXE"]);
      }

      // FPS (si disponible)
      if (ci.events && ci.events.onFrame) {
        let last = performance.now(), frames = 0;
        ci.events.onFrame(() => {
          frames++;
          const now = performance.now();
          if (now - last >= 1000) {
            fpsEl.textContent = frames.toString();
            frames = 0; last = now;
          }
        });
      }
    } catch (e) {
      document.body.innerHTML =
        `<pre style="color:#f55">API v8 no disponible: ${e?.message || e}</pre>`;
      console.error(e);
    }
  }

  start.addEventListener("click", boot);
})();
