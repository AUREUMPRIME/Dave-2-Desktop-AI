(() => {
  const K = {LEFT:37,UP:38,RIGHT:39,DOWN:40,CTRL:17,ALT:18,SPACE:32};
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function boot(ci){
    const tap = (...keys) => { try{ ci.simulateKeyPress(...keys); }catch{} };
    await sleep(600);
    for(let i=0;i<6;i++){ tap(K.SPACE); await sleep(300); }
    tap(K.RIGHT); await sleep(150);
    tap(K.LEFT);  await sleep(150);
  }

  window.addEventListener('dave2:ci-ready', ev => {
    const ci = ev && ev.detail && ev.detail.ci; if(!ci) return;
    const el = document.getElementById('agent'); if (el) el.textContent = 'ON';
    boot(ci);
  });
})();
