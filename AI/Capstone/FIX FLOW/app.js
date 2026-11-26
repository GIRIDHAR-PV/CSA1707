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
const KEY="fixflow-demo-v1",UK="fixflow-users-v1",SK="fixflow-session-v1",ADMIN_CODE="FIXFLOW-ADMIN";
let mem=null,usr=null,me=null;
const rd=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const now=()=>new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const tid=()=>"FF-"+Array.from({length:6},()=>"0123456789ABCDEF"[Math.random()*16|0]).join("");
/* demo-grade hash: accounts live only in this browser. A real deployment needs a server + bcrypt/OAuth. */
const hash=s=>{let a=0xdeadbeef,b=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^a>>>16,2246822507)^Math.imul(b^b>>>13,3266489909);b=Math.imul(b^b>>>16,2246822507)^Math.imul(a^a>>>13,3266489909);return(4294967296*(2097151&b)+(a>>>0)).toString(36)};
function seed(){
  const S=[["The fan in Room 204 isn't working.","Arun K","In progress","Ravi (Maintenance)"],["Sparking from the switch board in lab 3, please come immediately","Meena S","Open",""],["Wi-Fi is not working in the library","Dev P","Resolved","IT desk"],["Washroom on first floor is very dirty","Sana R","Open",""],["Timetable has a clash on Wednesday","Karthik V","Open",""],["Projector not turning on in class 5","Lakshmi N","In progress","IT desk"],["Water leak near the wiring in Block B","Imran A","Open",""],["Dustbin overflowing near canteen","Priya D","Resolved","Housekeeping"],["Marks not updated in portal for my internal exam","Rohit M","Open",""],["Light not working in hostel room 12 for days","Anita J","Open",""]];
  return S.map(([text,name,status,assigned],i)=>({id:"FF-"+(100200+i*377).toString(16).toUpperCase().padStart(6,"0"),name,email:"",text,...analyse(text),status,assigned,note:status==="Resolved"?"Fixed and verified.":"",created:now(),updated:now()}));
}
function load(){return mem||(mem=rd(KEY)||(wr(KEY,mem=seed()),mem))}
function save(){if(!wr(KEY,mem))toast("Storage is full - could not save.")}
const SHIFTS={"Mon–Fri":[1,2,3,4,5],"Mon–Sat":[1,2,3,4,5,6],"Every day":[0,1,2,3,4,5,6]};
const DEPTS=[...new Set(Object.values(INFO).map(v=>v[0]))];
const mk=(n,dept,sh,start,end)=>({id:"U-"+n.toLowerCase(),role:"worker",name:n,username:n.toLowerCase(),email:n.toLowerCase()+"@fixflow.demo",pass:hash(n.toLowerCase()+":worker123"),dept,days:SHIFTS[sh],start,end});
/* demo workers (password: worker123) so the admin dashboard has people to assign */
const users=()=>usr||(usr=rd(UK)||(wr(UK,usr=[mk("Ravi","Maintenance team","Mon–Fri","09:00","17:00"),mk("Suresh","Maintenance team","Mon–Sat","13:00","21:00"),mk("Kavya","IT support","Mon–Fri","09:00","17:00"),mk("Imran","IT support","Every day","10:00","18:00"),mk("Lakshmi","Housekeeping","Every day","07:00","15:00"),mk("Joseph","Security & Safety office","Every day","06:00","22:00"),mk("Anand","Academic office","Mon–Fri","09:00","16:00")]),usr));
const saveU=()=>wr(UK,usr),workers=()=>users().filter(u=>u.role==="worker");
const toMin=t=>+t.slice(0,2)*60+ +t.slice(3,5);
const iso=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
const fmtAt=s=>new Date(s).toLocaleString("en-GB",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const shiftTxt=w=>(Object.keys(SHIFTS).find(k=>SHIFTS[k].join()===w.days.join())||"Custom")+" "+w.start+"–"+w.end;
function free(w,at,skip){const m=at.getHours()*60+at.getMinutes();
  return w.days.includes(at.getDay())&&m>=toMin(w.start)&&m<=toMin(w.end)&&!load().some(c=>c.id!==skip&&c.wid===w.id&&c.status!=="Resolved"&&c.at&&Math.abs(new Date(c.at)-at)<36e5)}
const shrink=f=>new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(f);i.onload=()=>{const s=Math.min(1,720/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL("image/jpeg",.7))};i.onerror=no;i.src=u});

/* ---------- ui ---------- */
const $=s=>document.querySelector(s),main=$("#main");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pill=p=>`<span class="pill ${p}">${p}</span>`;
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}
const LOGO='<svg viewBox="0 0 26 26" aria-hidden="true"><rect width="26" height="26" rx="7" fill="var(--accent)"/><path d="M6 9h9a3 3 0 0 1 0 6H9M6 17h5" stroke="var(--accent-ink)" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
const NAV={complainant:[["submit","Submit"],["track","Track"]],worker:[["tasks","My tasks"]],admin:[["admin","Dashboard"],["workers","Workers"]]};
const ROLE={complainant:"Student / Faculty",worker:"Worker",admin:"Admin"};
const VIEW={submit:viewSubmit,track:viewTrack,tasks:viewTasks,admin:viewAdmin,workers:viewWorkers};
let ar="complainant",reg=false,adminF={q:"",category:"",priority:"",status:""},trackId="";
me=users().find(u=>u.id===rd(SK))||null;
function go(v,id){if(id!==undefined)trackId=id;if(location.hash.slice(1)===v)render();else location.hash=v}
function render(){
  const own=me?NAV[me.role]:[];let v=location.hash.slice(1);if(!own.some(x=>x[0]===v))v=own[0]&&own[0][0];
  $("#nav").innerHTML=`<div class="brand">${LOGO}Fix Flow</div>`+own.map(([k,l])=>`<button data-view="${k}" aria-current="${k===v?"page":"false"}">${l}</button>`).join("")+(me?`<span class="who">${esc(me.name)} · ${ROLE[me.role]}</span><button id="lo">Log out</button>`:"");
  document.querySelectorAll("nav [data-view]").forEach(b=>b.onclick=()=>go(b.dataset.view));
  if(me)$("#lo").onclick=()=>{me=null;wr(SK,null);history.replaceState(null,"",location.pathname);render()};
  me?VIEW[v]():viewAuth();
}
addEventListener("hashchange",render);
function enter(u){me=u;wr(SK,u.id);history.replaceState(null,"",location.pathname);toast("Welcome, "+u.name);render()}

function viewAuth(){
  const opt=a=>a.map(x=>`<option>${x}</option>`).join("");
  main.innerHTML=`<h1>${reg?"Create your account":"Log in to Fix Flow"}</h1><p class="sub">Choose your role, then ${reg?"fill in your details.":"sign in with your email or username."}</p>
  <div class="chips" style="margin:0 0 14px">${Object.keys(ROLE).map(r=>`<button type="button" class="chip" data-r="${r}" aria-pressed="${r===ar}">${ROLE[r]}</button>`).join("")}</div>
  <form class="panel" id="af" style="max-width:480px">
  ${reg?`<label for="n" style="margin-top:0">Full name</label><input id="n" required autocomplete="name"><label for="un">Username</label><input id="un" required autocomplete="username"><label for="em">Email (Gmail or any)</label><input id="em" type="email" required autocomplete="email">`:`<label for="id" style="margin-top:0">Email or username</label><input id="id" required autocomplete="username">`}
  <label for="pw">Password</label><input id="pw" type="password" required minlength="${reg?6:1}" autocomplete="${reg?"new-password":"current-password"}">
  ${reg&&ar==="worker"?`<label for="dp">Department</label><select id="dp">${opt(DEPTS)}</select><label for="sh">Working days</label><select id="sh">${opt(Object.keys(SHIFTS))}</select><div style="display:flex;gap:8px"><div style="flex:1"><label for="st">Shift start</label><input id="st" type="time" value="09:00" required></div><div style="flex:1"><label for="en">Shift end</label><input id="en" type="time" value="17:00" required></div></div>`:""}
  ${reg&&ar==="admin"?`<label for="ac">Admin invite code</label><input id="ac" required autocomplete="off">`:""}
  <p style="margin:18px 0 8px"><button class="btn" type="submit">${reg?"Register":"Log in"}</button></p>
  <p class="small">${reg?"Already registered?":"New here?"} <button type="button" class="link" id="sw">${reg?"Log in":"Create an account"}</button></p></form>`;
  document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{ar=b.dataset.r;viewAuth()});
  $("#sw").onclick=()=>{reg=!reg;viewAuth()};
  $("#af").onsubmit=e=>{e.preventDefault();const U=users(),v=i=>$("#"+i).value.trim(),pw=$("#pw").value;
    if(!reg){const k=v("id").toLowerCase(),u=U.find(x=>x.username===k||x.email===k);
      if(!u||u.pass!==hash(u.username+":"+pw))return toast("Wrong email/username or password.");
      if(u.role!==ar)return toast("That is a "+ROLE[u.role]+" account. Pick that tab.");
      return enter(u)}
    const un=v("un").toLowerCase(),em=v("em").toLowerCase();
    if(U.some(x=>x.username===un||x.email===em))return toast("Username or email is already registered.");
    if(ar==="admin"&&v("ac")!==ADMIN_CODE)return toast("Invalid admin invite code.");
    const u={id:"U-"+Date.now().toString(36),role:ar,name:v("n"),username:un,email:em,pass:hash(un+":"+pw)};
    if(ar==="worker"){if(v("st")>=v("en"))return toast("Shift end must be after shift start.");Object.assign(u,{dept:v("dp"),days:SHIFTS[v("sh")],start:v("st"),end:v("en")})}
    U.push(u);saveU();enter(u)};
}

function viewSubmit(){
  main.innerHTML=`<h1>Tell us what's wrong</h1><p class="sub">Write the problem the way you would say it. Fix Flow sorts it, ranks it and sends it to the right team. Submitting as <b>${esc(me.name)}</b>.</p>
  <div class="pipe"><span>Submit</span><span>Categorise</span><span>Prioritise</span><span>Assign</span><span>Photo proof</span></div>
  <div class="grid2"><form class="panel" id="f"><label for="text" style="margin-top:0">Complaint</label>
  <textarea id="text" placeholder="e.g. The fan in Room 204 isn't working."></textarea><div class="chips" id="ex"></div>
  <p style="margin:18px 0 0"><button class="btn" type="submit">Submit complaint</button></p></form>
  <aside class="panel" aria-live="polite"><h2>What the AI sees</h2><div id="pv" class="idle">Start typing and the category, priority and location appear here.</div></aside></div>`;
  const ex=["The fan in Room 204 isn't working.","Sparking from the socket in lab 3, urgent!","Wi-Fi is down in the library","Washroom near block B is dirty for days","Marks missing in the portal"];
  $("#ex").innerHTML=ex.map(e=>`<button type="button" class="chip">${esc(e)}</button>`).join("");
  const ta=$("#text"),pv=$("#pv");
  const upd=()=>{const t=ta.value.trim();if(t.length<5){pv.className="idle";pv.textContent="Start typing and the category, priority and location appear here.";return}
    pv.className="";pv.innerHTML=result(analyse(t))};
  ta.oninput=upd;
  document.querySelectorAll(".chip[type=button]").forEach(c=>c.onclick=()=>{ta.value=c.textContent;upd();ta.focus()});
  $("#f").onsubmit=e=>{e.preventDefault();const t=ta.value.trim();if(t.length<8){toast("Add a little more detail so we can route it.");ta.focus();return}
    const c={id:tid(),uid:me.id,name:me.name,email:me.email,text:t,...analyse(t),status:"Open",assigned:"",note:"",created:now(),updated:now()};
    load().unshift(c);save();done(c)};
}
function result(r){return`<dl class="kv"><dt>Category</dt><dd>${esc(r.category)}</dd><dt>Priority</dt><dd>${pill(r.priority)}</dd><dt>Location</dt><dd>${esc(r.location)}</dd><dt>Routed to</dt><dd>${esc(r.department)}</dd><dt>Confidence</dt><dd>${Math.round(r.confidence*100)}%${r.needsReview?' <span class="flag">An admin will double-check</span>':''}</dd></dl>`}
function done(c){
  main.innerHTML=`<h1>Complaint received</h1><div class="panel"><p class="sub" style="margin-bottom:6px">Your tracking ID. Keep it to follow progress.</p><div class="ticket">${c.id}</div>
  <p class="small">“${esc(c.text)}”</p>${result(c)}<p style="margin:18px 0 0;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="t">Track this complaint</button><button class="btn ghost" id="n">Submit another</button></p></div>`;
  $("#t").onclick=()=>go("track",c.id);$("#n").onclick=()=>go("submit");
}
const stars=n=>"★".repeat(Math.round(n))+"☆".repeat(5-Math.round(n)),freePill='<span class="pill Low">Free</span>';
const avg=w=>{const r=load().filter(c=>c.wid===w.id&&c.rating);return[r.length?r.reduce((a,c)=>a+c.rating,0)/r.length:0,r.length]};
const rateBlock=c=>c.rating?`<dt>Your rating</dt><dd class="stars">${stars(c.rating)}</dd>`:(c.status==="Resolved"&&c.wid&&c.uid===me.id?`<dt>Rate the work</dt><dd><select id="rt" style="width:auto" aria-label="Rating">${[5,4,3,2,1].map(n=>`<option value="${n}">${n} ${"★".repeat(n)}</option>`).join("")}</select> <button type="button" class="btn sm" id="rb">Submit rating</button></dd>`:"");
function wireRate(c,again){const b=$("#rb");if(b)b.onclick=()=>{c.rating=+$("#rt").value;c.updated=now();save();toast("Thanks for rating "+(c.assigned||"the worker"));again()}}
function viewTrack(){
  const mine=load().filter(c=>c.uid===me.id);
  main.innerHTML=`<h1>Track a complaint</h1><p class="sub">Pick one of your complaints or enter an ID.</p><form class="panel" id="tf" style="display:flex;gap:8px;flex-wrap:wrap"><input id="tid" placeholder="FF-XXXXXX" value="${esc(trackId)}" style="flex:1;min-width:180px" class="mono" aria-label="Ticket ID"><button class="btn">Find</button></form>
  ${mine.length?`<div class="chips">${mine.map(c=>`<button type="button" class="chip mono" data-id="${c.id}">${c.id}</button>`).join("")}</div>`:""}<div id="tr" style="margin-top:16px"></div>`;
  const show=()=>{const id=$("#tid").value.trim().toUpperCase();trackId=id;if(!id){$("#tr").innerHTML="";return}
    const c=load().find(x=>x.id===id);if(!c){$("#tr").innerHTML=`<div class="panel idle">No complaint found with ID ${esc(id)}. Check the ID and try again.</div>`;return}
    $("#tr").innerHTML=`<div class="panel"><div class="ticket">${c.id}</div><div class="steps">${["Open","In progress","Resolved"].map(s=>`<div class="${s===c.status?"on":""}">${s}</div>`).join("")}</div>
    <dl class="kv"><dt>Complaint</dt><dd>${esc(c.text)}</dd><dt>Category</dt><dd>${esc(c.category)}</dd><dt>Priority</dt><dd>${pill(c.priority)}</dd><dt>Location</dt><dd>${esc(c.location)}</dd><dt>Routed to</dt><dd>${esc(c.department)}</dd><dt>Assigned to</dt><dd>${esc(c.assigned||"Not yet assigned")}</dd>${c.at?`<dt>Scheduled</dt><dd>${fmtAt(c.at)}</dd>`:""}<dt>Note</dt><dd>${esc(c.note||"No note yet")}</dd>${c.proof?`<dt>Proof photo</dt><dd><img class="proof" src="${c.proof}" alt="Photo of the completed work"></dd>`:""}<dt>Submitted</dt><dd>${c.created}</dd><dt>Last update</dt><dd>${c.updated}</dd>${rateBlock(c)}</dl></div>`;wireRate(c,show)};
  $("#tf").onsubmit=e=>{e.preventDefault();show()};
  document.querySelectorAll(".chip[data-id]").forEach(b=>b.onclick=()=>{$("#tid").value=b.dataset.id;show()});show();
}

function viewTasks(){
  const mine=load().filter(c=>c.wid===me.id).sort((a,b)=>(a.status==="Resolved")-(b.status==="Resolved")||new Date(a.at)-new Date(b.at)),open=mine.filter(c=>c.status!=="Resolved").length;
  main.innerHTML=`<h1>My tasks</h1><p class="sub">${esc(me.dept)} · shift ${shiftTxt(me)} · ${open} open task${open===1?"":"s"}. Upload a photo of the finished work to close a task.</p>
  <div style="display:grid;gap:12px">${mine.length?mine.map(c=>`<div class="panel ${c.status==="Resolved"?"done":""}" data-id="${c.id}"><span class="ticket" style="font-size:1.1rem">${c.id}</span> ${pill(c.priority)} <span class="small">${c.status}</span>
  <p style="margin:8px 0">${esc(c.text)}</p><p class="small">${esc(c.location)} · scheduled ${c.at?fmtAt(c.at):"-"}</p>
  ${c.status==="Resolved"?(c.proof?`<img class="proof" src="${c.proof}" alt="Proof photo">`:""):`<label style="margin-top:6px">Proof photo (required)</label><input type="file" accept="image/*" capture="environment"><p style="margin:10px 0 0"><button class="btn sm">Submit photo &amp; mark resolved</button></p>`}</div>`).join(""):`<div class="panel idle">No tasks assigned to you yet. The admin will assign work during your shift.</div>`}</div>`;
  main.querySelectorAll(".panel[data-id] button").forEach(b=>b.onclick=async()=>{const p=b.closest(".panel"),f=p.querySelector("input").files[0];
    if(!f||!f.type.startsWith("image/"))return toast("Choose a photo of the completed work first.");
    b.disabled=true;try{const c=load().find(x=>x.id===p.dataset.id);c.proof=await shrink(f);c.status="Resolved";c.note=c.note||"Fixed by "+me.name+".";c.updated=now();save();toast(c.id+" marked resolved");viewTasks()}catch(e){b.disabled=false;toast("Could not read that image.")}});
}

function viewAdmin(){
  const all=load(),total=all.length,res=all.filter(c=>c.status==="Resolved").length,W=workers(),t0=new Date();
  const high=all.filter(c=>c.priority==="High"&&c.status!=="Resolved").length,rev=all.filter(c=>c.needsReview&&c.status!=="Resolved").length,avail=W.filter(w=>free(w,t0)).length;
  const by=Object.keys(INFO).map(k=>[k,all.filter(c=>c.category===k).length]).sort((a,b)=>b[1]-a[1]);
  const opt=(a,v)=>`<option value="">All</option>`+a.map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("");
  const nh=new Date();nh.setHours(nh.getHours()+1,0,0,0);
  main.innerHTML=`<h1>Admin dashboard</h1><p class="sub">Every complaint in one place, highest priority first. Assign each one to a free worker at a set time.</p>
  <div class="stats"><div class="stat"><b>${total}</b><span>Total complaints</span></div><div class="stat"><b style="color:var(--high)">${high}</b><span>High priority open</span></div><div class="stat"><b>${total?Math.round(100*res/total):0}%</b><span>Resolved</span></div><div class="stat"><b>${rev}</b><span>Need category review</span></div><div class="stat"><b>${avail}/${W.length}</b><span>Workers available now</span></div></div>
  <p style="margin:0 0 16px"><button class="btn ghost sm" id="gw">View workers, availability &amp; ratings →</button></p>
  <div class="panel"><h2>Recurring issues</h2><div class="bars">${by.map(([k,n])=>`<div class="bar"><span>${k}</span><div><i style="width:${total?Math.max(2,100*n/total):0}%"></i></div><em>${n}</em></div>`).join("")}</div></div>
  <div class="filters"><input id="q" placeholder="Search text, ID or location" value="${esc(adminF.q)}" aria-label="Search">
  <select id="fc" aria-label="Category">${opt(Object.keys(INFO),adminF.category).replace(">All<",">All categories<")}</select><select id="fp" aria-label="Priority">${opt(["High","Medium","Low"],adminF.priority).replace(">All<",">All priorities<")}</select><select id="fs" aria-label="Status">${opt(["Open","In progress","Resolved"],adminF.status).replace(">All<",">All statuses<")}</select></div>
  <div class="tw"><table><thead><tr><th>Complaint</th><th>AI result</th><th>Manage &amp; assign</th></tr></thead><tbody id="rows"></tbody></table></div>`;
  const ord={High:0,Medium:1,Low:2},K=(tr,k)=>tr.querySelector(`[data-k=${k}]`);
  const fill=tr=>{const c=load().find(x=>x.id===tr.dataset.id),at=new Date(K(tr,"at").value),dept=INFO[K(tr,"category").value][0],sel=K(tr,"wid"),cur=sel.value||c.wid||"",ws=workers().filter(w=>w.dept===dept),ok=ws.filter(w=>!isNaN(at)&&free(w,at,c.id));
    sel.innerHTML=`<option value="">${c.assigned&&!c.wid?esc(c.assigned)+" (manual)":"Unassigned"}</option>`+ws.map(w=>`<option value="${w.id}" ${w.id===cur?"selected":""}>${esc(w.name)} · ${shiftTxt(w)} · ${ok.includes(w)?"free":"busy/off"}</option>`).join("");
    tr.querySelector("[data-av]").textContent=`${ok.length} of ${ws.length} ${dept} workers available at that time`};
  const rows=()=>{const f=adminF,q=f.q.toLowerCase();
    const list=load().filter(c=>(!f.category||c.category===f.category)&&(!f.priority||c.priority===f.priority)&&(!f.status||c.status===f.status)&&(!q||(c.text+c.id+c.location).toLowerCase().includes(q)))
      .sort((a,b)=>(a.status==="Resolved")-(b.status==="Resolved")||ord[a.priority]-ord[b.priority]);
    $("#rows").innerHTML=list.length?list.map(c=>`<tr class="${c.priority} ${c.status==="Resolved"?"done":""}" data-id="${c.id}"><td style="min-width:230px"><b class="mono">${c.id}</b> <span class="small">${c.created}</span><br>${esc(c.text)}<br><span class="small">${esc(c.name||"Anonymous")}</span>${c.proof?`<br><img class="proof" src="${c.proof}" alt="Proof photo">`:""}</td>
    <td>${esc(c.category)}<br>${pill(c.priority)} <span class="small">${esc(c.location)}</span><br><span class="small">${esc(c.department)} · ${Math.round(c.confidence*100)}%</span>${c.needsReview?'<br><span class="flag">Review category</span>':''}</td>
    <td style="min-width:270px"><div style="display:grid;gap:6px;grid-template-columns:repeat(2,minmax(110px,1fr))"><select data-k="status" aria-label="Status">${["Open","In progress",...(c.status==="Resolved"?["Resolved"]:[])].map(s=>`<option ${s===c.status?"selected":""}>${s}</option>`).join("")}</select>
    <select data-k="priority" aria-label="Priority">${["High","Medium","Low"].map(s=>`<option ${s===c.priority?"selected":""}>${s}</option>`).join("")}</select>
    <select data-k="category" aria-label="Category" style="grid-column:1/-1">${Object.keys(INFO).map(s=>`<option ${s===c.category?"selected":""}>${s}</option>`).join("")}</select>
    <input data-k="at" type="datetime-local" value="${c.at||iso(nh)}" style="grid-column:1/-1" aria-label="Scheduled time"><select data-k="wid" style="grid-column:1/-1" aria-label="Worker"></select><span class="small" data-av style="grid-column:1/-1"></span>
    <input data-k="note" placeholder="Note to student" value="${esc(c.note)}" aria-label="Note" style="grid-column:1/-1"><button class="btn sm" style="grid-column:1/-1">Save${c.status==="Resolved"?"":" / assign"}</button></div></td></tr>`).join(""):`<tr><td colspan="3" class="idle">No complaints match these filters.</td></tr>`;
    $("#rows").querySelectorAll("tr[data-id]").forEach(tr=>{fill(tr);K(tr,"at").onchange=K(tr,"category").onchange=()=>fill(tr);
      tr.querySelector("button").onclick=()=>{const c=load().find(x=>x.id===tr.dataset.id),old=c.status,g=k=>K(tr,k).value.trim(),w=workers().find(x=>x.id===g("wid")),at=new Date(g("at"));
        if(w&&(isNaN(at)||!free(w,at,c.id)))return toast(w.name+" is not free at that time.");
        Object.assign(c,{status:g("status"),priority:g("priority"),category:g("category"),note:g("note")});c.department=INFO[c.category][0];c.needsReview=false;
        if(w){c.wid=w.id;c.assigned=w.name+" ("+w.dept+")";c.at=g("at");if(c.status==="Open")c.status="In progress"}else if(c.wid){c.wid="";c.assigned="";c.at=""}
        c.updated=now();save();toast(c.id+" updated"+(w?" · "+w.name+" assigned":"")+(c.status!==old?" · student alerted":""));viewAdmin()}});
  };
  $("#q").oninput=e=>{adminF.q=e.target.value;rows()};
  [["fc","category"],["fp","priority"],["fs","status"]].forEach(([id,k])=>$("#"+id).onchange=e=>{adminF[k]=e.target.value;rows()});
  $("#gw").onclick=()=>go("workers");
  rows();
}

function viewWorkers(){
  const W=workers(),rs=load().filter(c=>c.rating),overall=rs.length?(rs.reduce((a,c)=>a+c.rating,0)/rs.length).toFixed(1)+" ★":"-";
  main.innerHTML=`<h1>Workers</h1><p class="sub">Who is free, their shifts and the ratings students and faculty gave after each fix.</p>
  <div class="stats"><div class="stat"><b id="nf">0</b><span>Free at selected time</span></div><div class="stat"><b id="nb">0</b><span>Busy or off shift</span></div><div class="stat"><b>${W.length}</b><span>Registered workers</span></div><div class="stat"><b>${overall}</b><span>Average rating (${rs.length})</span></div></div>
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin:0 0 16px"><div><label for="wt" style="margin-top:0">Check availability at</label><input id="wt" type="datetime-local" value="${iso(new Date())}"></div>
  <div><label for="wd" style="margin-top:0">Department</label><select id="wd"><option value="">All departments</option>${DEPTS.map(d=>`<option>${d}</option>`).join("")}</select></div>
  <label style="display:flex;gap:8px;align-items:center;margin:0 0 10px"><input type="checkbox" id="wo" style="width:auto"> Free only</label></div>
  <div class="wgrid" id="wl"></div>`;
  const list=()=>{const at=new Date($("#wt").value),dep=$("#wd").value,only=$("#wo").checked,all=load();
    const R=W.map(w=>({w,ok:!isNaN(at)&&free(w,at),r:avg(w)}));
    $("#nf").textContent=R.filter(x=>x.ok).length;$("#nb").textContent=R.filter(x=>!x.ok).length;
    const L=R.filter(x=>(!dep||x.w.dept===dep)&&(!only||x.ok)).sort((a,b)=>b.ok-a.ok||b.r[0]-a.r[0]);
    $("#wl").innerHTML=L.length?L.map(({w,ok,r})=>{const done=all.filter(c=>c.wid===w.id&&c.status==="Resolved").length,open=all.filter(c=>c.wid===w.id&&c.status!=="Resolved").length;
      return`<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(w.name)}</b>${ok?freePill:'<span class="small">Busy / off</span>'}</div><div class="small">${esc(w.dept)} · ${shiftTxt(w)}</div>
      <p class="stars" style="margin:8px 0 2px">${r[1]?`${stars(r[0])} <b>${r[0].toFixed(1)}</b> <span class="small">(${r[1]} rating${r[1]>1?"s":""})</span>`:'<span class="small">No ratings yet</span>'}</p><div class="small">${done} done · ${open} open</div></div>`}).join(""):`<div class="panel idle">No workers match these filters.</div>`};
  $("#wt").oninput=list;$("#wd").onchange=list;$("#wo").onchange=list;list();
}
render();
