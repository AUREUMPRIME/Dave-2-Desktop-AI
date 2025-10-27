(() => {
  const K = { SPACE:32, LEFT:37, RIGHT:39 };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function afterReady(ci){
    await sleep(400);
    for(let i=0;i<6;i++){ try{ ci.simulateKeyPress(K.SPACE); }catch{} await sleep(220); }
    try{ ci.simulateKeyPress(K.RIGHT); }catch{}; await sleep(120);
    try{ ci.simulateKeyPress(K.LEFT); }catch{};
  }
  const el = document.getElementById("dos");
  Dos(el, {
    url: "/dave2.jsdos",
    pathPrefix: "/vendor/jsdos/emulators/",
    autoStart: true,
    kiosk: true,
    fullScreen: true,
    onEvent: (event, ci) => { if (event === "ci-ready"){ window.__dave2 = {ci}; afterReady(ci); } }
  });
})();
