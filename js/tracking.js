/* DeutschQuest 7.0 – Tracking Perfect */
(function(){
  const cfg = window.DQ_CONFIG || {};
  const KEY = "dq7_event_queue";
  const SID_KEY = "dq7_session_id";
  const PROFILE_KEY = "dq7_student_profile";

  function uid(prefix="dq"){
    return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,8);
  }
  function now(){ return new Date().toISOString(); }
  function getSessionId(){
    let id = sessionStorage.getItem(SID_KEY);
    if(!id){ id = uid("session"); sessionStorage.setItem(SID_KEY,id); }
    return id;
  }
  function getProfile(){
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
    catch(e){ return {}; }
  }
  function setProfile(p){
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p || {}));
  }
  function getQueue(){
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch(e){ return []; }
  }
  function saveQueue(q){ localStorage.setItem(KEY, JSON.stringify(q.slice(-500))); }

  function enrich(event){
    const p = getProfile();
    return Object.assign({
      event_id: uid("event"),
      created_at: now(),
      session_id: getSessionId(),
      version: cfg.VERSION || "7.0",
      course: cfg.COURSE || "DeutschQuest",
      student_name: p.name || "",
      student_class: p.className || "",
      user_agent: navigator.userAgent,
      page: location.pathname.split("/").pop() || "index.html"
    }, event || {});
  }

  function sendOne(event){
    if(cfg.DEMO_MODE || !cfg.SCRIPT_URL){
      return Promise.resolve({demo:true});
    }
    const payload = JSON.stringify(event);
    const body = new URLSearchParams();
    body.append("payload", payload);
    return fetch(cfg.SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body
    });
  }

  async function flush(){
    let q = getQueue();
    if(!q.length) return;
    const keep = [];
    for(const ev of q){
      try { await sendOne(ev); }
      catch(e){ keep.push(ev); }
    }
    saveQueue(keep);
  }

  function track(type, data={}){
    const ev = enrich(Object.assign({type}, data));
    const q = getQueue(); q.push(ev); saveQueue(q);
    // Enviar sin bloquear la actividad.
    flush();
    return ev;
  }

  function trackCritical(type, data={}){
    const ev = enrich(Object.assign({type}, data));
    const q = getQueue(); q.push(ev); saveQueue(q);
    if(!cfg.DEMO_MODE && cfg.SCRIPT_URL && navigator.sendBeacon){
      try{
        const body = new URLSearchParams();
        body.append("payload", JSON.stringify(ev));
        navigator.sendBeacon(cfg.SCRIPT_URL, body);
      }catch(e){}
    }
    return ev;
  }

  window.DQTracker = { track, trackCritical, flush, getProfile, setProfile, getSessionId };

  document.addEventListener("visibilitychange", ()=>{
    if(document.hidden) trackCritical("page_hidden", {detail:"La alumna salió de la pestaña o la ocultó."});
    else track("page_visible", {detail:"La alumna volvió a la página."});
  });
  window.addEventListener("beforeunload", ()=> trackCritical("page_unload", {detail:"La alumna cerró o recargó la página."}));
})();
