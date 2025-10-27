(()=>{const H1="Cross-Origin-Embedder-Policy",H2="Cross-Origin-Opener-Policy";
if(typeof window==="undefined"){
  self.addEventListener("install",()=>self.skipWaiting());
  self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
  self.addEventListener("fetch",e=>{
    e.respondWith((async()=>{
      const r=await fetch(e.request); const h=new Headers(r.headers);
      h.set(H1,"require-corp"); h.set(H2,"same-origin");
      return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h});
    })());
  });
}else{
  if(!window.crossOriginIsolated && "serviceWorker" in navigator){
    navigator.serviceWorker.register("./coi-serviceworker.js",{scope:"./"})
      .then(()=>location.reload()).catch(console.warn);
  }
}
})();
