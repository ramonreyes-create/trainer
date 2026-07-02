function initialConfig(){
  const c = window.DQ_CONFIG || {};
  document.getElementById("sheetUrl").value = c.sheetUrl || "";
  document.getElementById("schoolName").value = c.schoolName || "DeutschQuest DSD II";
  document.getElementById("sendMode").value = c.sendMode || "final";
  buildConfig(false);
}
function readForm(){
  return {
    appVersion: "7.0",
    schoolName: document.getElementById("schoolName").value.trim() || "DeutschQuest DSD II",
    sheetUrl: document.getElementById("sheetUrl").value.trim(),
    passPercent: 80,
    sendMode: document.getElementById("sendMode").value || "final"
  };
}
function buildConfig(showStatus=true){
  const c = readForm();
  const code = `// DeutschQuest DSD II 7.0 – GitHub Ready\nwindow.DQ_CONFIG = ${JSON.stringify(c,null,2)};\n`;
  document.getElementById("configCode").value = code;
  if(showStatus){
    const st=document.getElementById("status");
    st.textContent="Config-Code erstellt. Kopiere ihn jetzt in js/config.js.";
    st.className="small saveOk";
  }
}
async function copyConfig(){
  buildConfig(false);
  try{
    await navigator.clipboard.writeText(document.getElementById("configCode").value);
    const st=document.getElementById("status");
    st.textContent="Config-Code kopiert.";
    st.className="small saveOk";
  }catch(e){
    const st=document.getElementById("status");
    st.textContent="Kopieren nicht möglich. Bitte manuell markieren und kopieren.";
    st.className="small saveBad";
  }
}
async function testConnection(){
  const c=readForm();
  const st=document.getElementById("status");
  if(!c.sheetUrl){st.textContent="Bitte zuerst die Web-App-URL eintragen.";st.className="small saveBad";return;}
  if(!c.sheetUrl.includes("script.google.com") || !c.sheetUrl.endsWith("/exec")){
    st.textContent="Die URL sieht nicht korrekt aus. Sie sollte von script.google.com kommen und mit /exec enden.";
    st.className="small saveBad";return;
  }
  try{
    await fetch(c.sheetUrl,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({appVersion:"7.0",timestamp:new Date().toISOString(),sessionId:"TEST",name:"TEST",course:"TEST",theme:"TEST",mode:"Verbindungstest 7.0",correct:1,total:1,percent:100,timeSeconds:0,details:[{timestamp:new Date().toISOString(),sessionId:"TEST",name:"TEST",course:"TEST",theme:"TEST",activity:"Test",item:"Test",prompt:"Test",answer:"Test",expected:"Test",correct:true}],userAgent:navigator.userAgent})});
    st.textContent="Test gesendet. Prüfe im Google Sheet: Es sollten die Blätter Resumen und Detalle erscheinen.";
    st.className="small saveOk";
  }catch(e){
    st.textContent="Test fehlgeschlagen. Prüfe Veröffentlichung des Apps Scripts.";
    st.className="small saveBad";
  }
}
initialConfig();
