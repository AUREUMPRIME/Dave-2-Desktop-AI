(()=>{const H1='Cross-Origin-Embedder-Policy',H2='Cross-Origin-Opener-Policy';
if(typeof window==='undefined'){self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const r=e.request;e.respondWith((async()=>{
  const resp=await fetch(r);const nh=new Headers(resp.headers); nh.set(H1,'require-corp'); nh.set(H2,'same-origin');
  return new Response(resp.body,{status:resp.status,statusText:resp.statusText,headers:nh});
})());});}
else{if(!window.crossOriginIsolated && 'serviceWorker' in navigator){
  navigator.serviceWorker.register('./coi-serviceworker.js',{scope:'./'}).then(()=>location.reload()).catch(console.warn);
}}})();
