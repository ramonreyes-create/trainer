
let phaseStart = Date.now();


/* DeutschQuest 8.1 – Registro total de sesión
   Mantiene vocabulario/actividades de 6.3 y agrega historial completo local + Google Sheets. */
const DQ_SESSION_KEY = "dqFullSessionLog";
let sessionStart = Date.now();
let currentPhaseId = null;
let focusLostCount = 0;
let fullscreenExitCount = 0;

function uid(){return "dq-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}
function getSession(){
  let stored = localStorage.getItem(DQ_SESSION_KEY);
  if(stored){try{return JSON.parse(stored)}catch(e){}}
  const obj={sessionId:uid(), startedAt:new Date().toISOString(), finishedAt:"", student:{name:"",course:""}, events:[], totals:{}};
  localStorage.setItem(DQ_SESSION_KEY,JSON.stringify(obj));
  return obj;
}
function saveSession(obj){localStorage.setItem(DQ_SESSION_KEY,JSON.stringify(obj)); refreshLogPreview();}
function recordEvent(type, detail={}){
  const obj=getSession();
  const set=getSettings ? getSettings() : {name:"",course:""};
  obj.student={name:set.name||"",course:set.course||""};
  const theme = (typeof getTheme==="function" && document.getElementById('themeSelect')) ? getTheme() : null;
  const modeLabel = (typeof getModeLabel==="function") ? getModeLabel() : "";
  obj.events.push({
    at:new Date().toISOString(),
    secondsFromStart:Math.round((Date.now()-sessionStart)/1000),
    type,
    themeId:theme?.id||"",
    theme:theme?.title||"",
    mode:modeLabel,
    phaseId:currentPhaseId||"",
    detail
  });
  saveSession(obj);
}
function eventSummary(){
  const obj=getSession();
  const activityEvents=obj.events.filter(e=>["phase_start","answer_checked","memory_finished","crossword_checked","open_text_changed"].includes(e.type));
  const answers=obj.events.filter(e=>e.type==="answer_checked");
  const ok=answers.filter(e=>e.detail && e.detail.correct===true).length;
  const wrong=answers.filter(e=>e.detail && e.detail.correct===false).length;
  const themes=[...new Set(obj.events.map(e=>e.theme).filter(Boolean))];
  const modes=[...new Set(obj.events.map(e=>e.mode).filter(Boolean))];
  return {events:obj.events.length,activityEvents:activityEvents.length,answers:answers.length,ok,wrong,themes:themes.length,modes:modes.length};
}
function refreshLogPreview(){
  const el=document.getElementById("sessionLogPreview");
  if(!el)return;
  const sum=eventSummary();
  const obj=getSession();
  el.innerHTML=`<strong>Registro acumulado:</strong> ${sum.events} eventos · ${sum.answers} respuestas · ${sum.ok} correctas · ${sum.wrong} por revisar/incorrectas · ${sum.themes} tema(s) · ${focusLostCount} cambio(s) de pestaña · ${fullscreenExitCount} salida(s) de pantalla completa.`;
  const list=document.getElementById("sessionLogList");
  if(list){
    list.innerHTML=obj.events.slice(-8).reverse().map(e=>`<li><strong>${new Date(e.at).toLocaleTimeString()}</strong> ${esc(e.type)} · ${esc(e.theme||"")} · ${esc(e.mode||"")}</li>`).join("");
  }
}
function resetFullSession(){
  if(!confirm("Möchtest du wirklich das komplette lokale Protokoll löschen?"))return;
  localStorage.removeItem(DQ_SESSION_KEY); sessionStart=Date.now(); currentPhaseId=null; focusLostCount=0; fullscreenExitCount=0; getSession(); refreshLogPreview();
  const status=document.getElementById("saveStatus"); if(status) status.textContent="Lokales Protokoll wurde neu gestartet.";
}
function describeTask(task){
  if(!task)return {};
  const q=task.querySelector(".question")?.innerText || task.querySelector("strong")?.innerText || task.innerText.slice(0,120);
  const input=task.querySelector("input")?.value || task.querySelector("select")?.value || task.querySelector(".answerBox")?.textContent || "";
  return {question:q.trim().slice(0,300), answerGiven:input, expected:task.dataset.answer||"", taskClass:task.className};
}
function attachOpenTextTracking(){
  document.querySelectorAll(".task.open textarea").forEach((ta,idx)=>{
    ta.addEventListener("change",()=>recordEvent("open_text_changed",{part:idx+1,text:ta.value.trim()}));
  });
}
document.addEventListener("visibilitychange",()=>{if(document.hidden){focusLostCount++; recordEvent("focus_lost",{count:focusLostCount});}});
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement){fullscreenExitCount++; recordEvent("fullscreen_exit",{count:fullscreenExitCount});}});
window.addEventListener("beforeunload",()=>recordEvent("page_leave",{}));

function effectiveConfig(){
  return window.DQ_CONFIG || {appVersion:"6.3", schoolName:"DeutschQuest DSD II", sheetUrl:"", courses:["DSD II"], passPercent:80};
}
function saveStudent(){
  localStorage.setItem("dqStudentName",document.getElementById("studentName").value.trim());
  localStorage.setItem("dqStudentCourse",document.getElementById("studentCourse").value.trim());
}
function fillCourseSelect(){
  const c=effectiveConfig();
  const sel=document.getElementById("studentCourse");
  sel.innerHTML="";
  (c.courses||["DSD II"]).forEach(course=>{
    const o=document.createElement("option");
    o.value=course;o.textContent=course;sel.appendChild(o);
  });
  sel.value=localStorage.getItem("dqStudentCourse")||sel.value;
}
function getSettings(){
  const c=effectiveConfig();
  return {
    name:document.getElementById("studentName")?.value.trim() || localStorage.getItem("dqStudentName") || "",
    course:document.getElementById("studentCourse")?.value.trim() || localStorage.getItem("dqStudentCourse") || "",
    sheetUrl:(c.sheetUrl||"").trim()
  };
}
function getModeLabel(){
  const sel=document.getElementById("modeSelect");
  return sel ? sel.options[sel.selectedIndex].text : "";
}
function collectErrors(){
  const errors=[];
  document.querySelectorAll(".task").forEach(t=>{
    if(t.dataset.correct==="0"){
      let ans=t.dataset.answer || "";
      if(ans) errors.push(ans);
    }
  });
  return errors.join(" | ");
}
function getCurrentScore(){
  const tasks=[...document.querySelectorAll(".task:not(.open)")];
  const ok=tasks.filter(t=>t.dataset.correct==="1").length;
  return {ok,total:tasks.length,percent:tasks.length?Math.round(ok/tasks.length*100):0};
}
async function sendCurrentResults(){
  saveStudent();
  const s=getSettings();
  const status=document.getElementById("saveStatus");
  if(!s.name || !s.course){status.textContent="Bitte Name und Kurs eingeben.";status.className="small saveBad";return;}
  if(!s.sheetUrl){status.textContent="Google-Sheets-URL fehlt. Der Lehrer muss die URL in js/config.js eintragen.";status.className="small saveBad";return;}
  recordEvent("manual_send_clicked",{});
  const score=getCurrentScore();
  const session=getSession();
  session.finishedAt=new Date().toISOString();
  session.student={name:s.name,course:s.course};
  session.totals={...eventSummary(), currentPhaseCorrect:score.ok, currentPhaseTotal:score.total, currentPhasePercent:score.percent, totalTimeSeconds:Math.round((Date.now()-sessionStart)/1000), focusLostCount, fullscreenExitCount};
  saveSession(session);
  const payload={
    type:"full_session",
    timestamp:new Date().toISOString(),
    name:s.name,
    course:s.course,
    theme:getTheme().title,
    mode:getModeLabel(),
    correct:score.ok,
    total:score.total,
    percent:score.percent,
    timeSeconds:session.totals.totalTimeSeconds,
    focusLostCount,
    fullscreenExitCount,
    events:session.events,
    summary:session.totals,
    errors:collectErrors(),
    userAgent:navigator.userAgent
  };
  try{
    await fetch(s.sheetUrl,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
    status.textContent="Komplettes Protokoll wurde gesendet: alle Themen, Phasen, Antworten und Ereignisse.";
    status.className="small saveOk";
  }catch(e){
    status.textContent="Senden fehlgeschlagen. Das lokale Protokoll bleibt gespeichert.";
    status.className="small saveBad";
  }
}


function fillSelect(){let s=document.getElementById('themeSelect');THEMES.forEach(t=>{let o=document.createElement('option');o.value=t.id;o.textContent=t.title+' – '+t.es;s.appendChild(o)})}
function getTheme(){return THEMES.find(t=>t.id===document.getElementById('themeSelect').value)}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function norm(s){return (s||"").trim().toLowerCase().replaceAll("ä","ae").replaceAll("ö","oe").replaceAll("ü","ue").replaceAll("ß","ss")}
function clean(s){return s.toUpperCase().replaceAll("Ä","AE").replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("ß","SS").replace(/[^A-Z0-9]/g,"")}
function render(){let t=getTheme(),m=document.getElementById('modeSelect').value; phaseStart=Date.now(); currentPhaseId=uid();let h=`<section class="card"><span class="badge">${esc(t.title)}</span><h2>${esc(t.title)}</h2></section>`; if(m==="training")h+=training(t); if(m==="families")h+=familiesMode(t); if(m==="prep")h+=prepMode(t); if(m==="memory")h+=memory(t); if(m==="crossword")h+=crossword(t); if(m==="exam")h+=exam(t); if(m==="mini")h+=mini(t); document.getElementById('content').innerHTML=h; updateScore(); recordEvent('phase_start',{modeValue:m}); if(m==="memory")initMemory(t); if(m==="training")initLetterTasks(); attachOpenTextTracking(); refreshLogPreview();}
function training(t){let items=t.words.slice(0,8), spanish=shuffle(items.map(x=>x[1]));let h=`<section class="card"><span class="badge">Phase 1</span><h2>Was gehört zusammen?</h2><p class="small">Ordne jedes deutsche Wort seiner Bedeutung zu.</p><div class="matchGrid">`;items.forEach(w=>{h+=`<div class="matchItem task match" data-answer="${esc(w[1])}"><strong>${esc(w[0])}</strong><select><option value="">Bedeutung wählen</option>${spanish.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("")}</select><button class="primary" onclick="checkMatch(this)">Prüfen</button><div class="feedback"></div></div>`});h+=`</div></section><section class="card"><span class="badge">Phase 2</span><h2>Schreibe das Wort</h2><p class="small">Bilde das deutsche Wort mit den Buchstaben. Benutzte Buchstaben verschwinden.</p>`;items.slice(0,4).forEach(w=>{h+=`<div class="task letterTask" data-answer="${esc(w[0])}"><div class="question">${esc(w[1])} →</div><div class="answerBox"></div><div class="letterChoices"></div><button class="secondary" onclick="undoLetter(this)">←</button><button class="secondary" onclick="clearLetters(this)">Löschen</button><button class="primary" onclick="checkLetters(this)">Prüfen</button><div class="feedback"></div></div>`});return h+`</section>`}
function initLetterTasks(){document.querySelectorAll(".letterTask").forEach(task=>{task.dataset.pressed="[]";let letters=shuffle(clean(task.dataset.answer).split(""));let box=task.querySelector(".letterChoices");letters.forEach((l,i)=>{let b=document.createElement("button");b.textContent=l;b.dataset.idx=i;b.onclick=()=>{task.querySelector(".answerBox").textContent+=l;b.disabled=true;let arr=JSON.parse(task.dataset.pressed);arr.push(i);task.dataset.pressed=JSON.stringify(arr)};box.appendChild(b)})})}
function undoLetter(b){let t=b.closest(".task"),arr=JSON.parse(t.dataset.pressed||"[]");if(!arr.length)return;let idx=arr.pop();t.dataset.pressed=JSON.stringify(arr);t.querySelector(".answerBox").textContent=t.querySelector(".answerBox").textContent.slice(0,-1);let btn=t.querySelector(`.letterChoices button[data-idx="${idx}"]`);if(btn)btn.disabled=false}
function clearLetters(b){let t=b.closest(".task");t.querySelector(".answerBox").textContent="";t.dataset.pressed="[]";t.querySelectorAll(".letterChoices button").forEach(x=>x.disabled=false)}
function checkLetters(b){let t=b.closest(".task"),v=t.querySelector(".answerBox").textContent,a=clean(t.dataset.answer),f=t.querySelector(".feedback"),ok=v===a;f.textContent=ok?"Richtig!":"Noch nicht. Richtige Antwort: "+t.dataset.answer;f.className="feedback "+(ok?"correct":"wrong");t.dataset.correct=ok?"1":"0";recordEvent('answer_checked',{...describeTask(t),correct:ok});updateScore()}
function familiesMode(t){let h=`<section class="card"><span class="badge">Phase 3</span><h2>Wortfamilien: Verb – Nomen – Adjektiv</h2><table class="familyTable"><tr><th>Verb</th><th>Nomen</th><th>Adjektiv</th><th></th></tr>`;t.families.forEach((f,i)=>{let hide=i%3;h+=`<tr class="task family" data-answer="${esc(f[hide])}"><td>${hide===0?'<input placeholder="Verb">':esc(f[0])}</td><td>${hide===1?'<input placeholder="Nomen">':esc(f[1])}</td><td>${hide===2?'<input placeholder="Adjektiv">':esc(f[2])}</td><td><button class="primary" onclick="checkFamily(this)">Prüfen</button><div class="feedback"></div></td></tr>`});return h+`</table></section>`}
function prepMode(t){let h=`<section class="card"><span class="badge">Phase 4</span><h2>Verben mit Präpositionen</h2><p class="small">Benutze die spanische Hilfe und ergänze die passende Präposition. Die deutsche Struktur und der Kasus erscheinen erst nach dem Prüfen.</p>`;t.prep.forEach((p,i)=>{let base=["für","mit","auf","an","von","um","über","zu","gegen","unter","vor"];let opts=shuffle([p[2],...base.filter(x=>x!==p[2]).slice(0,4)]);h+=`<div class="prepCard task" data-answer="${esc(p[2])}"><div class="question"><strong>Hilfe:</strong> ${esc(p[0])}<br>${esc(p[4])}</div><select><option value="">Präposition wählen</option>${opts.map(o=>`<option value="${o}">${o}</option>`).join("")}</select><button class="primary" onclick="checkPrep(this)">Prüfen</button><div class="feedback"></div><div class="prepSolution"><strong>${esc(p[1])}</strong> + ${esc(p[2])} <span class="case">${esc(p[3])}</span></div></div>`});return h+`</section>`}
function exam(t){if(!t.luecken || !t.luecken.sentences || !t.luecken.items){return '<section class="card"><h2>Lückentext</h2><p class="wrong">Für dieses Thema fehlen Daten.</p></section>'}let words=shuffle(t.luecken.items.map(x=>x[0]));let sentences=t.luecken.sentences.map((s,i)=>`<p class="lueckenText">${i+1}. ${s.replace("___", `<span class="inlineBlank task" data-answer="${esc(t.luecken.items[i][0])}"><input placeholder="${i+1}"></span>`)}</p>`).join("");return `<section class="card"><span class="badge">Phase 7</span><h2>Lückentext</h2><div class="wordbank">${words.map(w=>`<span>${esc(w)}</span>`).join("")}</div>${sentences}<button class="primary" onclick="checkLuecken()">Prüfen</button><p id="lueckenFeedback" class="feedback"></p></section>`}
function memory(t){return `<section class="card"><span class="badge">Phase 5</span><h2>Memory</h2><div class="stage"><span>Züge: <b id="moves">0</b></span><span>Paare: <b id="pairs">0</b>/8</span></div><div id="memoryGrid" class="memoryGrid"></div></section>`}
function crossword(t){let words=t.words.slice(0,8);let h=`<section class="card"><span class="badge">Phase 6</span><h2>Wortkreuzrätsel</h2><button class="primary" onclick="checkCrossword()">Prüfen</button><button id="showSolutionBtn" class="hint" onclick="showCrossAnswers()">Lösung anzeigen</button><div class="crossWrap"><div class="crossWord">`;words.forEach((w,idx)=>{let cw=clean(w[0]);h+=`<div class="crossRow" data-word="${cw}"><span class="rowNum">${idx+1}</span>`;[...cw].forEach((ch,i)=>{h+=`<input class="letterBox ${i===0?'fixed':''}" maxlength="1" value="${i===0?ch:''}" ${i===0?'readonly':''}>`});h+=`</div>`});h+=`</div></div><div class="clues"><h3>Hinweise</h3><ol>${words.map((w,i)=>`<li><strong>${i+1}.</strong> ${esc(w[1])}</li>`).join("")}</ol><p id="crossResult" class="feedback"></p></div></section>`;return h}
function mini(t){return `<section class="card"><span class="badge">Phase 8</span><h2>Meinung schreiben</h2><p class="small">Wähle mindestens fünf Wörter und mindestens zwei Verben mit Präpositionen.</p><div class="wordbank">${t.words.slice(0,10).map(w=>`<span>${esc(w[0])}</span>`).join("")}</div><div class="wordbank">${t.prep.slice(0,8).map(p=>`<span>${esc(p[1])} + ${esc(p[2])}</span>`).join("")}</div><div class="task open"><h3>Behauptung</h3><textarea placeholder="Meiner Meinung nach ..."></textarea></div><div class="task open"><h3>Begründung</h3><textarea placeholder="Ein wichtiger Grund dafür ist, dass ..."></textarea></div><div class="task open"><h3>Beispiel</h3><textarea placeholder="Ein Beispiel dafür ist ..."></textarea></div><div class="task open"><h3>Schluss</h3><textarea placeholder="Deshalb bin ich der Ansicht, dass ..."></textarea></div></section>`}
function initMemory(t){let pairs=t.words.slice(0,8),cards=[];pairs.forEach((w,i)=>{cards.push({p:i,t:w[0],type:"de"});cards.push({p:i,t:w[1],type:"es"})});cards=shuffle(cards);let grid=document.getElementById("memoryGrid"),open=[],moves=0,matched=0;cards.forEach(c=>{let d=document.createElement("div");d.className="memCard hidden";d.dataset.p=c.p;d.dataset.type=c.type;d.onclick=()=>{if(d.classList.contains("matched")||!d.classList.contains("hidden")||open.length===2)return;d.classList.remove("hidden");d.textContent=c.t;open.push(d);if(open.length===2){moves++;document.getElementById("moves").textContent=moves;setTimeout(()=>{if(open[0].dataset.p===open[1].dataset.p&&open[0].dataset.type!==open[1].dataset.type){open.forEach(x=>x.classList.add("matched"));matched++;document.getElementById("pairs").textContent=matched;if(matched===8)recordEvent("memory_finished",{moves});}else{open.forEach(x=>{x.classList.add("hidden");x.textContent=""})}open=[]},700)}};grid.appendChild(d)})}
function checkMatch(b){let t=b.closest(".task"),v=t.querySelector("select").value,a=t.dataset.answer,f=t.querySelector(".feedback"),ok=v===a;f.textContent=ok?"Richtig!":"Noch nicht.";f.className="feedback "+(ok?"correct":"wrong");t.dataset.correct=ok?"1":"0";recordEvent('answer_checked',{...describeTask(t),correct:ok});updateScore()}
function checkFamily(b){let t=b.closest(".task"),i=t.querySelector("input"),f=t.querySelector(".feedback"),ok=norm(i.value)===norm(t.dataset.answer);f.textContent=ok?"Richtig!":"Noch nicht. Richtige Antwort: "+t.dataset.answer;f.className="feedback "+(ok?"correct":"wrong");t.dataset.correct=ok?"1":"0";recordEvent('answer_checked',{...describeTask(t),correct:ok});updateScore()}
function checkPrep(b){let t=b.closest(".task"),v=t.querySelector("select").value,a=t.dataset.answer,f=t.querySelector(".feedback"),ok=v===a;f.textContent=ok?"Richtig!":"Noch nicht. Richtige Präposition: "+a;f.className="feedback "+(ok?"correct":"wrong");t.dataset.correct=ok?"1":"0";t.querySelector(".prepSolution").style.display="block";updateScore()}
function checkLuecken(){let blanks=[...document.querySelectorAll(".inlineBlank.task")];let okCount=0;blanks.forEach(b=>{let inp=b.querySelector("input");let ok=norm(inp.value)===norm(b.dataset.answer);inp.style.borderColor=ok?"#16a34a":"#dc2626";inp.style.background=ok?"#dcfce7":"#fee2e2";b.dataset.correct=ok?"1":"0";recordEvent('answer_checked',{...describeTask(b),correct:ok,answerGiven:inp.value});if(ok)okCount++});let f=document.getElementById("lueckenFeedback");f.textContent=okCount===blanks.length?"Sehr gut!":`${okCount}/${blanks.length} richtig.`;f.className="feedback "+(okCount===blanks.length?"correct":"wrong");updateScore()}
function checkCrossword(){let rows=[...document.querySelectorAll(".crossRow")];let allFilled=rows.every(r=>[...r.querySelectorAll(".letterBox")].every(inp=>inp.value.trim()!==""));let result=document.getElementById("crossResult");document.querySelectorAll(".letterBox").forEach(i=>i.classList.remove("ok","bad"));document.getElementById("showSolutionBtn").style.display="none";if(!allFilled){result.textContent="Bitte zuerst alle Wörter vollständig schreiben.";result.className="feedback wrong";return}let allOk=true;rows.forEach(r=>{let word=r.dataset.word;[...r.querySelectorAll(".letterBox")].forEach((inp,i)=>{let ok=clean(inp.value)===word[i];inp.classList.add(ok?"ok":"bad");if(!ok)allOk=false})});result.textContent=allOk?"Sehr gut! Alle Wörter sind richtig.":"Einige Buchstaben sind noch falsch.";result.className="feedback "+(allOk?"correct":"wrong");document.getElementById("showSolutionBtn").style.display="inline-block";recordEvent("crossword_checked",{correct:allOk,filled:allFilled})}
function showCrossAnswers(){document.querySelectorAll(".crossRow").forEach(r=>{let word=r.dataset.word;[...r.querySelectorAll(".letterBox")].forEach((inp,i)=>{inp.value=word[i];inp.classList.remove("bad");inp.classList.add("ok")})})}
function updateScore(){let tasks=[...document.querySelectorAll(".task:not(.open)")];let ok=tasks.filter(t=>t.dataset.correct==="1").length;document.getElementById("score").textContent=ok;document.getElementById("total").textContent=tasks.length;document.getElementById("bar").style.width=tasks.length?ok/tasks.length*100+"%":"0%"}
function resetCurrent(){render()}
fillSelect();fillCourseSelect();document.getElementById('studentName').value=localStorage.getItem('dqStudentName')||'';getSession();render();refreshLogPreview();