
(() => {
  const PASS = 'Nugget07';
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const state = { about:null, offers:null, whatsOn:null, hours:null, contact:{phone:'',fbTitle:'',fbUrl:'',addr:''}, gigs:[], fixtures:[] };
  const LSKEY='phoenix-data-v3';
  function saveTextState(){ localStorage.setItem(LSKEY, JSON.stringify({about:state.about,offers:state.offers,whatsOn:state.whatsOn,hours:state.hours,contact:state.contact,gigs:state.gigs.map(g=>({t:g.t||'',d:g.d||'',b:g.b||'',posterId:g.posterId||null})),fixtures:state.fixtures})); }
  function loadTextState(){ const raw=localStorage.getItem(LSKEY); if(!raw) return; try{Object.assign(state, JSON.parse(raw));}catch(e){} }
  let db; const IDB_NAME='phoenix-idb-v3', IDB_STORE='files';
  function idbInit(){ return new Promise((resolve,reject)=>{ const req=indexedDB.open(IDB_NAME,1); req.onupgradeneeded=e=>{db=e.target.result; if(!db.objectStoreNames.contains(IDB_STORE)){db.createObjectStore(IDB_STORE,{keyPath:'id', autoIncrement:true});}}; req.onsuccess=e=>{db=e.target.result; resolve();}; req.onerror=reject; });}
  function idbPut(obj){ return new Promise((res,rej)=>{ const tx=db.transaction([IDB_STORE],'readwrite'); tx.objectStore(IDB_STORE).put(obj).onsuccess=e=>res(e.target.result); tx.onerror=rej;}); }
  function idbGet(id){ return new Promise((res,rej)=>{ const tx=db.transaction([IDB_STORE],'readonly'); tx.objectStore(IDB_STORE).get(id).onsuccess=e=>res(e.target.result); tx.onerror=rej;}); }
  function idbList(){ return new Promise((res,rej)=>{ const tx=db.transaction([IDB_STORE],'readonly'); const arr=[]; tx.objectStore(IDB_STORE).openCursor().onsuccess=e=>{ const cur=e.target.result; if(cur){arr.push(cur.value); cur.continue();} else res(arr);}; tx.onerror=rej;});}
  function idbClear(){ return new Promise((res,rej)=>{ const tx=db.transaction([IDB_STORE],'readwrite'); tx.objectStore(IDB_STORE).clear().onsuccess=()=>res(); tx.onerror=rej;});}

  function el(tag, attrs={}, ...children){ const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') e.className=v; else if(k==='html') e.innerHTML=v; else e.setAttribute(k,v);}); children.flat().forEach(c=>{ if(c==null) return; e.appendChild(typeof c==='string'?document.createTextNode(c):c);}); return e; }

  function renderAbout(){ if(state.about) qs('#aboutText').textContent=state.about; }
  function renderOffers(){ if(!state.offers) return; const ul=qs('#offersList'); ul.innerHTML=''; state.offers.forEach(o=>ul.appendChild(el('li',{},o))); }
  function renderWhatsOn(){ const d=qs('#whatsOn'); const rows=state.whatsOn||['Open Mic','Pub Quiz','Acoustic Night','DJ & 2-for-£10 Cocktails','Live Band','Live Music','Chilled Classics']; const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; d.innerHTML=rows.map((txt,i)=>`<div class="list-row"><b>${days[i]}</b><span>${txt}</span></div>`).join(''); }
  function renderHours(){ const d=qs('#hours'); const rows=state.hours||['12:00 – 23:00','12:00 – 23:00','12:00 – 23:00','12:00 – 23:00','12:00 – 01:00','12:00 – 01:00','12:00 – 23:00']; const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']; d.innerHTML=rows.map((txt,i)=>`<div class="list-row"><b>${days[i]}</b><span>${txt}</span></div>`).join(''); }
  async function renderGigs(){ const wrap=qs('#gigs'); wrap.innerHTML=''; const gigs=state.gigs&&state.gigs.length?state.gigs.slice(0,4):[]; for(const g of gigs){ let imgURL=''; if(g.posterId){ const rec=await idbGet(g.posterId); if(rec) imgURL=URL.createObjectURL(rec.blob);} const card=el('div',{class:'card'}); if(imgURL) card.appendChild(el('img',{src:imgURL,alt:g.t||'poster'})); const body=el('div',{class:'gig-body'}); body.appendChild(el('h3',{},g.t||'')); body.appendChild(el('div',{},g.d||'')); if(g.b) body.appendChild(el('p',{},g.b)); card.appendChild(body); wrap.appendChild(card);} }
  function renderFixtures(){ const host=qs('#fixtures'); host.innerHTML=''; const fx=state.fixtures&&state.fixtures.length?state.fixtures.slice(0,3):[{h:'Man United',a:'Liverpool',t:'Sun 3:00 PM',c:'Sky Sports'},{h:'Arsenal',a:'Chelsea',t:'Mon 5:30 PM',c:'BT Sport'},{h:'Man City',a:'Tottenham',t:'Tue 2:00 PM',c:'Sky Sports'}]; for(const f of fx){ host.appendChild(el('div',{class:'list-row'}, el('div',{}, `${f.h}  vs  ${f.a}`), el('div',{}, f.t) )); host.appendChild(el('div',{style:'margin:-12px 0 8px 14px'}, el('span',{class:'badge'+(f.c&&f.c.includes('BT')?' bt':'')}, f.c||''))); } }
  async function renderGallery(){ const host=qs('#gallery'); host.innerHTML=''; const files=await idbList(); const imgs=files.filter(f=>f.kind==='gallery'); if(imgs.length===0){ for(let i=0;i<5;i++){ host.appendChild(el('img',{src:'phoenix-hero.jpg',alt:'placeholder'})); } } else { imgs.forEach(rec=>host.appendChild(el('img',{src:URL.createObjectURL(rec.blob),alt:'gallery'}))); } }
  async function renderVideos(){ const host=qs('#videos'); host.innerHTML=''; const files=await idbList(); const vids=files.filter(f=>f.kind==='video'); vids.forEach(rec=>{ const url=URL.createObjectURL(rec.blob); const v=el('video',{src:url,controls:true,style:'width:100%; border-radius:16px; box-shadow:0 8px 18px rgba(0,0,0,.35)'}); host.appendChild(v); }); }
  function renderAll(){ renderAbout(); renderOffers(); renderWhatsOn(); renderHours(); renderFixtures(); renderGigs(); renderGallery(); renderVideos(); }

  (async function init(){ document.getElementById('yr').textContent=new Date().getFullYear(); loadTextState(); await idbInit(); renderAll(); })();

  // secret gesture
  let tapCount=0, tapTimer=null; const footer=document.querySelector('.footer'); footer.addEventListener('click', ()=>{ tapCount++; if(tapTimer) clearTimeout(tapTimer); tapTimer=setTimeout(()=>{tapCount=0;}, 1200); if(tapCount>=5){ document.getElementById('editLock').style.display='flex'; tapCount=0; } });

  const lockBtn=qs('#editLock'), modal=qs('#adminModal'), bg=qs('#mbg'); const passIn=qs('#passInput'), unlockBtn=qs('#unlockBtn'), lockState=qs('#lockState'); const adminSections=qs('#adminSections');
  lockBtn.addEventListener('click', ()=>{ modal.style.display='block'; bg.style.display='block'; });
  qs('#closeX').addEventListener('click', ()=>{ modal.style.display='none'; bg.style.display='none'; });
  bg.addEventListener('click', ()=>{ modal.style.display='none'; bg.style.display='none'; });

  function fillAdminFields(){ qs('#aboutField').value = state.about || qs('#aboutText').textContent.trim(); qs('#offersField').value=(state.offers||['Happy Hour Mon–Fri 4–6pm','2-for-£10 cocktails every Friday','Local ales on rotation']).join('\\n'); const wo=state.whatsOn||['Open Mic','Pub Quiz','Acoustic Night','DJ & 2-for-£10 Cocktails','Live Band','Live Music','Chilled Classics']; qs('#whatsOnField').value=wo.join('\\n'); const hrs=state.hours||['12:00 – 23:00','12:00 – 23:00','12:00 – 23:00','12:00 – 23:00','12:00 – 01:00','12:00 – 01:00','12:00 – 23:00']; qs('#hoursField').value=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>`${d} ${hrs[i]}`).join('\\n'); qs('#phoneField').value=state.contact.phone||''; qs('#fbTitleField').value=state.contact.fbTitle||''; qs('#fbUrlField').value=state.contact.fbUrl||''; qs('#addrField').value=state.contact.addr||''; const g=state.gigs||[]; for(let i=1;i<=4;i++){ qs('#gig'+i+'t').value=g[i-1]?.t||''; qs('#gig'+i+'d').value=g[i-1]?.d||''; qs('#gig'+i+'b').value=g[i-1]?.b||''; } }

  unlockBtn.addEventListener('click', ()=>{ if((passIn.value||'').trim()===PASS){ lockState.textContent='Unlocked ✓'; adminSections.classList.remove('hidden'); fillAdminFields(); } else { lockState.textContent='Wrong passphrase'; } });

  qs('#saveBtn').addEventListener('click', async ()=>{
    state.about = qs('#aboutField').value.trim();
    state.offers = qs('#offersField').value.split('\\n').map(s=>s.trim()).filter(Boolean);
    state.whatsOn = qs('#whatsOnField').value.split('\\n').map(s=>s.trim()).filter(Boolean).slice(0,7);
    const hoursLines = qs('#hoursField').value.split('\\n').map(s=>s.trim()).filter(Boolean).slice(0,7);
    state.hours = hoursLines.map(line => line.replace(/^... ?/,'').trim());
    state.contact.phone = qs('#phoneField').value.trim();
    state.contact.fbTitle = qs('#fbTitleField').value.trim();
    state.contact.fbUrl = qs('#fbUrlField').value.trim();
    state.contact.addr = qs('#addrField').value.trim();
    state.gigs = []; for(let i=1;i<=4;i++){ const t=qs('#gig'+i+'t').value.trim(); const d=qs('#gig'+i+'d').value.trim(); const b=qs('#gig'+i+'b').value.trim(); if(t||d||b) state.gigs.push({t,d,b}); }
    state.fixtures = [
      {h:qs('#f1h').value.trim(), a:qs('#f1a').value.trim(), t:qs('#f1t').value.trim(), c:qs('#f1c').value.trim()},
      {h:qs('#f2h').value.trim(), a:qs('#f2a').value.trim(), t:qs('#f2t').value.trim(), c:qs('#f2c').value.trim()},
      {h:qs('#f3h').value.trim(), a:qs('#f3a').value.trim(), t:qs('#f3t').value.trim(), c:qs('#f3c').value.trim()},
    ].filter(f=>f.h&&f.a);
    saveTextState(); renderAll(); alert('Saved!');
  });

  qs('#clearBtn').addEventListener('click', async ()=>{ localStorage.removeItem(LSKEY); await idbClear(); location.reload(); });

  function fileToBlob(file){ return new Promise((res)=>{ const r=new FileReader(); r.onload=()=>res(new Blob([r.result],{type:file.type})); r.readAsArrayBuffer(file); });}
  qs('#heroFile').addEventListener('change', async (e)=>{ const f=e.target.files?.[0]; if(!f) return; const blob=await fileToBlob(f); await idbPut({kind:'hero', id:1, blob}); qs('#heroImg').src=URL.createObjectURL(blob); });
  qs('#galleryFiles').addEventListener('change', async (e)=>{ const files=Array.from(e.target.files||[]); for(const f of files){ const blob=await fileToBlob(f); await idbPut({kind:'gallery', blob}); } renderGallery(); });
  qs('#gigFiles').addEventListener('change', async (e)=>{ const files=Array.from(e.target.files||[]).slice(0,4); const ids=[]; for(const f of files){ const blob=await fileToBlob(f); const id=await idbPut({kind:'gig', blob}); ids.push(id);} for(let i=0;i<state.gigs.length && i<ids.length;i++){ state.gigs[i].posterId=ids[i]; } saveTextState(); renderGigs(); });
  qs('#videoFiles').addEventListener('change', async (e)=>{ const files=Array.from(e.target.files||[]); for(const f of files){ const blob=await fileToBlob(f); await idbPut({kind:'video', blob}); } renderVideos(); });
})();
