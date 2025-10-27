param([string]$Root="$PWD",[switch]$Apply,[switch]$Serve,[int]$Port=5190)
$ErrorActionPreference='Stop'
$pub=Join-Path $Root 'public'; $vend=Join-Path $pub 'vendor/jsdos'; $emu=Join-Path $vend 'emulators'
$idx=Join-Path $pub 'index.html'; $app=Join-Path $pub 'app.js'; $css=Join-Path $pub 'style.css'
$kill=Join-Path $pub '_sw_kill.js'
$jsdos=Join-Path $vend 'js-dos.js'; $emjs=Join-Path $emu 'emulators.js'
$wbjs=Join-Path $emu 'wdosbox.js'; $wbwasm=Join-Path $emu 'wdosbox.wasm'
$BUILD=(Get-Date -Format yyyyMMddHHmmss)

function _mk($p){ New-Item -ItemType Directory -Path $p -Force | Out-Null }
function _bk($p){ if(Test-Path $p){ _mk (Join-Path $Root 'archive/backups'); Copy-Item $p (Join-Path $Root ("archive/backups/{0}.{1}.bak" -f (Split-Path $p -Leaf),$BUILD)) -Force } }

function Ensure-JsDos {
  _mk $pub; _mk $vend; _mk $emu
  $tmp=Join-Path $env:TEMP 'dave2_jsdos_pkg'
  if(-not (Test-Path (Join-Path $tmp 'node_modules/js-dos/dist'))){
    npm i js-dos@8.3.20 --prefix $tmp --no-audit --no-fund --loglevel=error | Out-Null
  }
  Copy-Item (Join-Path $tmp 'node_modules/js-dos/dist/js-dos.js') $jsdos -Force
  Copy-Item (Join-Path $tmp 'node_modules/js-dos/dist/wdosbox.*') $emu -Force
  if(-not (Test-Path $emjs)){
    Invoke-WebRequest -UseBasicParsing -Uri 'https://v8.js-dos.com/latest/emulators/emulators.js' -OutFile $emjs -TimeoutSec 60
  }
  if(Test-Path (Join-Path $pub 'coi-serviceworker.js')){ Remove-Item (Join-Path $pub 'coi-serviceworker.js') -Force }
}

function Write-Files {
  _bk $idx; _bk $app
  @"
// mata cualquier SW activo en este scope
if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(rs=>{rs.forEach(r=>r.unregister())});
  if(window.caches){ caches.keys().then(ks=>ks.forEach(k=>caches.delete(k))); }
}
"@ | Set-Content -Path $kill -Encoding UTF8

  @"
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
  <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
  <link rel="stylesheet" href="/style.css?b=$BUILD">
  <title>Dave-2 Desktop AI</title>
</head>
<body>
  <script src="/_sw_kill.js?b=$BUILD"></script>
  <button id="start">Iniciar</button>
  &nbsp;Agente: <b id="agent">OFF</b> &nbsp;FPS: <span id="fps">-</span>
  <div><canvas id="dos" width="320" height="200"></canvas></div>

  <script src="/vendor/jsdos/emulators/emulators.js?b=$BUILD"></script>
  <script>emulators.pathPrefix="/vendor/jsdos/emulators/";</script>
  <script src="/vendor/jsdos/js-dos.js?b=$BUILD"></script>
  <script src="/app.js?b=$BUILD"></script>
</body>
</html>
"@ | Set-Content -Path $idx -Encoding UTF8

  @'
(() => {
  const $ = s => document.querySelector(s);
  const btn = $('#start'); const canvas = $('#dos'); const fpsEl = $('#fps');

  btn.addEventListener('click', async () => {
    try{
      btn.disabled = true;
      const player = await Dos(canvas, { pathPrefix: "/vendor/jsdos/emulators/", url: "/dave2.jsdos" });
      const ev = (player && player.events && player.events()) || (player && player.ci && player.ci.events && player.ci.events());
      if (ev && ev.onFps) ev.onFps(v => fpsEl.textContent = v);
    }catch(e){
      document.body.innerHTML = `<pre style="color:#f55">API v8 error: ${e && e.message ? e.message : e}</pre>`;
    }
  });
})();
