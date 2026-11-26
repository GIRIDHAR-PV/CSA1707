/* ---------- NLP engine (browser port of nlp.py) ---------- */
const INFO={"Electrical / Maintenance":["Maintenance team","Medium"],"Safety / Urgent":["Security & Safety office","High"],"IT / Network":["IT support","Medium"],"Cleanliness":["Housekeeping","Low"],"Academic":["Academic office","Low"]};
const DATA={
"Electrical / Maintenance":["The fan in Room 204 is not working","tube light is not working in the classroom","switch board is broken in lab 3","socket in hostel room is loose and not giving power","ceiling fan makes loud noise and wobbles","AC is not cooling in seminar hall","bulb fused in the corridor","door lock of my room is broken","bench in class is broken","tap is not working in the hostel bathroom","window glass is cracked in class 5","no power supply in block B since morning","water cooler is not working on second floor","light flickering in the library","chair is damaged in the lecture hall","fan regulator is faulty in room 12"],
"Safety / Urgent":["There is sparking from the switch board in room 110","fire near the canteen kitchen","water leak near electrical wiring in the lab","a student got injured on the staircase","exposed live wires in the corridor","smell of gas in the chemistry lab","ceiling is falling down in the classroom","someone is harassing students near the hostel gate","short circuit and smoke from the AC","fire extinguisher is missing and there is smoke in the lab","emergency medical help needed a student fainted","ragging complaint in hostel block C","dangerous broken glass on the floor injury risk","stray dogs attacking students near the gate","electric shock from the water cooler","pipe burst and flooding near the power room"],
"IT / Network":["Wi-Fi is not working in the library","projector is not turning on in class 3","computer in lab 2 is not booting","internet is very slow in hostel","cannot login to the student portal","LMS website is down","printer in the lab is not working","no network connectivity in block A","keyboard and mouse are not working on the lab computer","email account is blocked","software not installed on lab systems","projector display is blurry and flickering","wifi password is not working","ERP portal shows error while paying fees","lab system hangs repeatedly","smart board is not responding"],
"Cleanliness":["The washroom on first floor is very dirty","dustbin is overflowing near the canteen","classroom is not cleaned for days","bad smell in the hostel corridor","garbage is not collected near the playground","toilets have no water and are unclean","mess hall tables are dirty","cobwebs and dust in the lab","drinking water tank is dirty","washroom has no soap or tissue","floor is wet and dirty after rain","mosquitoes and stagnant water behind the block","canteen food area is unhygienic","dustbins are not placed in the corridor","sweeper has not cleaned the room","smelly drainage near the hostel"],
"Academic":["The timetable has a clash on Wednesday","marks not updated in the portal","faculty is not taking classes regularly","internal assessment marks are wrong","exam hall ticket not generated","syllabus not completed before exams","need revaluation of my answer sheet","attendance is wrongly recorded","lab record submission date clarification","professor is not available for doubts","course registration is not opening","elective subject change request","result is not published yet","assignment marks missing for my subject","the class schedule changes without notice","scholarship form status is pending"]};
const HIGH=/fire|spark\w*|smoke|leak\w*|injur\w*|shock|live wire|exposed|\bgas\b|harass\w*|ragging|emergency|flood\w*|short circuit|faint\w*|dangerous|attack\w*|collapse|falling/i;
const URGENT=/urgent\w*|immediately|asap|right now|emergency/i;
const LONG=/since (?:\w+ )?(?:days|week)|for (?:\w+ )?(?:days|weeks)|again and again|repeated\w*|exam/i;
const toks=t=>{const w=t.toLowerCase().replace(/wi-fi/g,'wifi').match(/[a-z0-9]+/g)||[];const o=[...w];for(let i=0;i<w.length-1;i++)o.push(w[i]+'_'+w[i+1]);return o};
const cats=Object.keys(DATA),counts={},vocab=new Set(),tot={};
cats.forEach(c=>{counts[c]={};tot[c]=0;DATA[c].forEach(s=>toks(s).forEach(t=>{counts[c][t]=(counts[c][t]||0)+1;tot[c]++;vocab.add(t)}))});
function classify(text){
  const t=toks(text);const lp=cats.map(c=>{let s=0;t.forEach(w=>{s+=Math.log(((counts[c][w]||0)+.5)/(tot[c]+.5*vocab.size))});return s});
  const m=Math.max(...lp),e=lp.map(x=>Math.exp(x-m)),z=e.reduce((a,b)=>a+b,0),p=e.map(x=>x/z),i=p.indexOf(Math.max(...p));
  return [cats[i],p[i]];
}
function findLoc(text){
  const pats=[/\b(?:room|class(?:room)?|lab|hall|block|floor|hostel)\s*(?:no\.?\s*)?[A-Za-z]?\d+[A-Za-z]?\b/i,/\b(?:library|canteen|mess|gate|playground|auditorium|seminar hall|washroom|cafeteria|parking)\b/i,/\b(?:[Bb]lock|[Hh]ostel)\s+[A-Z]\b/];
  for(const p of pats){const m=text.match(p);if(m)return m[0].replace(/\b\w/g,c=>c.toUpperCase())}return"Not specified";
}
function analyse(text){
  let [category,conf]=classify(text);
  if(HIGH.test(text)&&category!=="Safety / Urgent"&&conf<.6)category="Safety / Urgent";
  const base=INFO[category][1];let priority=base;
  if(HIGH.test(text))priority="High";
  else if(URGENT.test(text))priority={Low:"Medium",Medium:"High",High:"High"}[base];
  else if(LONG.test(text)&&base==="Low")priority="Medium";
  return{category,confidence:Math.round(conf*100)/100,priority,location:findLoc(text),department:INFO[category][0],needsReview:conf<.3};
}

/* ---------- storage ---------- */
const KEY="fixflow-demo-v1";let mem=null;
const now=()=>new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const tid=()=>"FF-"+Array.from({length:6},()=>"0123456789ABCDEF"[Math.random()*16|0]).join("");
function seed(){
  const S=[["The fan in Room 204 isn't working.","Arun K","In progress","Ravi (Maintenance)"],["Sparking from the switch board in lab 3, please come immediately","Meena S","Open",""],["Wi-Fi is not working in the library","Dev P","Resolved","IT desk"],["Washroom on first floor is very dirty","Sana R","Open",""],["Timetable has a clash on Wednesday","Karthik V","Open",""],["Projector not turning on in class 5","Lakshmi N","In progress","IT desk"],["Water leak near the wiring in Block B","Imran A","Open",""],["Dustbin overflowing near canteen","Priya D","Resolved","Housekeeping"],["Marks not updated in portal for my internal exam","Rohit M","Open",""],["Light not working in hostel room 12 for days","Anita J","Open",""]];
  return S.map(([text,name,status,assigned],i)=>({id:"FF-"+(100200+i*377).toString(16).toUpperCase().padStart(6,"0"),name,email:"",text,...analyse(text),status,assigned,note:status==="Resolved"?"Fixed and verified.":"",created:now(),updated:now()}));
}
function load(){
  if(mem)return mem;
  try{const r=localStorage.getItem(KEY);if(r){mem=JSON.parse(r);return mem}}catch(e){}
  mem=seed();save();return mem;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(mem))}catch(e){}}

/* ---------- ui ---------- */
const $=s=>document.querySelector(s),main=$("#main");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pill=p=>`<span class="pill ${p}">${p}</span>`;
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2200)}
const VIEWS=["submit","track","admin"];
let adminF={q:"",category:"",priority:"",status:""},trackId="";
function go(v,id){if(id!==undefined)trackId=id;location.hash=v;render()}
function render(){
  let v=location.hash.slice(1);if(!VIEWS.includes(v))v="submit";
  document.querySelectorAll("nav button").forEach(b=>b.setAttribute("aria-current",b.dataset.view===v?"page":"false"));
  ({submit:viewSubmit,track:viewTrack,admin:viewAdmin})[v]();
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>go(b.dataset.view));
addEventListener("hashchange",render);

function viewSubmit(){
  main.innerHTML=`<h1>Tell us what's wrong</h1><p class="sub">Write the problem the way you would say it. Fix Flow sorts it, ranks it and sends it to the right team.</p>
  <div class="pipe"><span>Submit</span><span>Categorise</span><span>Prioritise</span><span>Store</span><span>Dashboard</span></div>
  <div class="grid2"><form class="panel" id="f"><label for="text" style="margin-top:0">Complaint</label>
  <textarea id="text" placeholder="e.g. The fan in Room 204 isn't working."></textarea>
  <div class="chips" id="ex"></div>
  <label for="name">Your name (optional)</label><input id="name" autocomplete="name">
  <label for="email">Email for status alerts (optional)</label><input id="email" type="email" autocomplete="email">
  <p style="margin:18px 0 0"><button class="btn" type="submit">Submit complaint</button></p></form>
  <aside class="panel" aria-live="polite"><h2>What the AI sees</h2><div id="pv" class="idle">Start typing and the category, priority and location appear here.</div></aside></div>`;
  const ex=["The fan in Room 204 isn't working.","Sparking from the socket in lab 3, urgent!","Wi-Fi is down in the library","Washroom near block B is dirty for days","Marks missing in the portal"];
  $("#ex").innerHTML=ex.map(e=>`<button type="button" class="chip">${esc(e)}</button>`).join("");
  const ta=$("#text"),pv=$("#pv");
  const upd=()=>{const t=ta.value.trim();if(t.length<5){pv.className="idle";pv.textContent="Start typing and the category, priority and location appear here.";return}
    const r=analyse(t);pv.className="";pv.innerHTML=result(r)};
  ta.oninput=upd;
  document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{ta.value=c.textContent;upd();ta.focus()});
  $("#f").onsubmit=e=>{e.preventDefault();const t=ta.value.trim();if(t.length<8){toast("Add a little more detail so we can route it.");ta.focus();return}
    const r=analyse(t),c={id:tid(),name:$("#name").value.trim(),email:$("#email").value.trim(),text:t,...r,status:"Open",assigned:"",note:"",created:now(),updated:now()};
    load().unshift(c);save();done(c)};
}
function result(r){return`<dl class="kv"><dt>Category</dt><dd>${esc(r.category)}</dd><dt>Priority</dt><dd>${pill(r.priority)}</dd><dt>Location</dt><dd>${esc(r.location)}</dd><dt>Routed to</dt><dd>${esc(r.department)}</dd><dt>Confidence</dt><dd>${Math.round(r.confidence*100)}%${r.needsReview?' <span class="flag">An admin will double-check</span>':''}</dd></dl>`}
function done(c){
  main.innerHTML=`<h1>Complaint received</h1><div class="panel"><p class="sub" style="margin-bottom:6px">Your tracking ID. Keep it to follow progress.</p><div class="ticket">${c.id}</div>
  <p class="small">“${esc(c.text)}”</p>${result(c)}<p style="margin:18px 0 0;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="t">Track this complaint</button><button class="btn ghost" id="n">Submit another</button></p></div>`;
  $("#t").onclick=()=>go("track",c.id);$("#n").onclick=()=>go("submit");
}
function viewTrack(){
  main.innerHTML=`<h1>Track a complaint</h1><p class="sub">Enter the ID you received after submitting.</p><form class="panel" id="tf" style="display:flex;gap:8px;flex-wrap:wrap"><input id="tid" placeholder="FF-XXXXXX" value="${esc(trackId)}" style="flex:1;min-width:180px" class="mono" aria-label="Ticket ID"><button class="btn">Find</button></form><div id="tr" style="margin-top:16px"></div>`;
  const show=()=>{const id=$("#tid").value.trim().toUpperCase();trackId=id;if(!id){$("#tr").innerHTML="";return}
    const c=load().find(x=>x.id===id);if(!c){$("#tr").innerHTML=`<div class="panel idle">No complaint found with ID ${esc(id)}. Check the ID and try again.</div>`;return}
    $("#tr").innerHTML=`<div class="panel"><div class="ticket">${c.id}</div><div class="steps">${["Open","In progress","Resolved"].map(s=>`<div class="${s===c.status?"on":""}">${s}</div>`).join("")}</div>
    <dl class="kv"><dt>Complaint</dt><dd>${esc(c.text)}</dd><dt>Category</dt><dd>${esc(c.category)}</dd><dt>Priority</dt><dd>${pill(c.priority)}</dd><dt>Location</dt><dd>${esc(c.location)}</dd><dt>Routed to</dt><dd>${esc(c.department)}</dd><dt>Assigned to</dt><dd>${esc(c.assigned||"Not yet assigned")}</dd><dt>Note</dt><dd>${esc(c.note||"No note yet")}</dd><dt>Submitted</dt><dd>${c.created}</dd><dt>Last update</dt><dd>${c.updated}</dd></dl></div>`};
  $("#tf").onsubmit=e=>{e.preventDefault();show()};show();
}
function viewAdmin(){
  const all=load(),total=all.length,res=all.filter(c=>c.status==="Resolved").length;
  const high=all.filter(c=>c.priority==="High"&&c.status!=="Resolved").length,rev=all.filter(c=>c.needsReview&&c.status!=="Resolved").length;
  const by=Object.keys(INFO).map(k=>[k,all.filter(c=>c.category===k).length]).sort((a,b)=>b[1]-a[1]);
  const opt=(a,v)=>`<option value="">All</option>`+a.map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("");
  main.innerHTML=`<h1>Admin dashboard</h1><p class="sub">Every complaint in one place, highest priority first.</p>
  <div class="stats"><div class="stat"><b>${total}</b><span>Total complaints</span></div><div class="stat"><b style="color:var(--high)">${high}</b><span>High priority open</span></div><div class="stat"><b>${total?Math.round(100*res/total):0}%</b><span>Resolved</span></div><div class="stat"><b>${rev}</b><span>Need category review</span></div></div>
  <div class="panel"><h2>Recurring issues</h2><div class="bars">${by.map(([k,n])=>`<div class="bar"><span>${k}</span><div><i style="width:${total?Math.max(2,100*n/total):0}%"></i></div><em>${n}</em></div>`).join("")}</div></div>
  <div class="filters"><input id="q" placeholder="Search text, ID or location" value="${esc(adminF.q)}" aria-label="Search">
  <select id="fc" aria-label="Category">${opt(Object.keys(INFO),adminF.category).replace(">All<",">All categories<")}</select><select id="fp" aria-label="Priority">${opt(["High","Medium","Low"],adminF.priority).replace(">All<",">All priorities<")}</select><select id="fs" aria-label="Status">${opt(["Open","In progress","Resolved"],adminF.status).replace(">All<",">All statuses<")}</select></div>
  <div class="tw"><table><thead><tr><th>Complaint</th><th>AI result</th><th>Manage</th></tr></thead><tbody id="rows"></tbody></table></div>`;
  const ord={High:0,Medium:1,Low:2};
  const rows=()=>{const f=adminF,q=f.q.toLowerCase();
    const list=load().filter(c=>(!f.category||c.category===f.category)&&(!f.priority||c.priority===f.priority)&&(!f.status||c.status===f.status)&&(!q||(c.text+c.id+c.location).toLowerCase().includes(q)))
      .sort((a,b)=>(a.status==="Resolved")-(b.status==="Resolved")||ord[a.priority]-ord[b.priority]);
    $("#rows").innerHTML=list.length?list.map(c=>`<tr class="${c.priority} ${c.status==="Resolved"?"done":""}" data-id="${c.id}"><td style="min-width:230px"><b class="mono">${c.id}</b> <span class="small">${c.created}</span><br>${esc(c.text)}<br><span class="small">${esc(c.name||"Anonymous")}</span></td>
    <td>${esc(c.category)}<br>${pill(c.priority)} <span class="small">${esc(c.location)}</span><br><span class="small">${esc(c.department)} · ${Math.round(c.confidence*100)}%</span>${c.needsReview?'<br><span class="flag">Review category</span>':''}</td>
    <td><div style="display:grid;gap:6px;grid-template-columns:repeat(2,minmax(110px,1fr))"><select data-k="status" aria-label="Status">${["Open","In progress","Resolved"].map(s=>`<option ${s===c.status?"selected":""}>${s}</option>`).join("")}</select>
    <select data-k="priority" aria-label="Priority">${["High","Medium","Low"].map(s=>`<option ${s===c.priority?"selected":""}>${s}</option>`).join("")}</select>
    <select data-k="category" aria-label="Category" style="grid-column:1/-1">${Object.keys(INFO).map(s=>`<option ${s===c.category?"selected":""}>${s}</option>`).join("")}</select>
    <input data-k="assigned" placeholder="Assign to" value="${esc(c.assigned)}" aria-label="Assign to"><input data-k="note" placeholder="Note to student" value="${esc(c.note)}" aria-label="Note"><button class="btn sm" style="grid-column:1/-1">Save</button></div></td></tr>`).join(""):`<tr><td colspan="3" class="idle">No complaints match these filters.</td></tr>`;
    $("#rows").querySelectorAll("tr[data-id] button").forEach(b=>b.onclick=()=>{const tr=b.closest("tr"),c=load().find(x=>x.id===tr.dataset.id),old=c.status;
      tr.querySelectorAll("[data-k]").forEach(el=>c[el.dataset.k]=el.value.trim());c.department=INFO[c.category][0];c.needsReview=false;c.updated=now();save();
      toast(c.id+" updated"+(c.status!==old?" · student alerted":""));viewAdmin()});
  };
  $("#q").oninput=e=>{adminF.q=e.target.value;rows()};
  [["fc","category"],["fp","priority"],["fs","status"]].forEach(([id,k])=>$("#"+id).onchange=e=>{adminF[k]=e.target.value;rows()});
  rows();
}
render();
