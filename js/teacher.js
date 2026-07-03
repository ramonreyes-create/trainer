function initialConfig(){
  const c = window.DQ_CONFIG || {};
  document.getElementById("sheetUrl").value = c.sheetUrl || "";
  document.getElementById("schoolName").value = c.schoolName || "DeutschQuest DSD II";
  document.getElementById("courses").value = (c.courses || ["DSD II", "III Medio", "IV Medio"]).join(", ");
  buildConfig(false);
}
function readForm(){
  return {
    appVersion: "8.6-final-functional",
    schoolName: document.getElementById("schoolName").value.trim() || "DeutschQuest DSD II",
    sheetUrl: document.getElementById("sheetUrl").value.trim(),
    courses: document.getElementById("courses").value.split(",").map(x=>x.trim()).filter(Boolean),
    passPercent: 80
  };
}
function buildConfig(showStatus=true){
  const c = readForm();
  const code = `// DeutschQuest DSD II 8.6 Final Funcional – GitHub Ready
window.DQ_CONFIG = ${JSON.stringify(c,null,2)};
`;
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
    await fetch(c.sheetUrl,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({timestamp:new Date().toISOString(),name:"TEST",course:"TEST",theme:"TEST",mode:"Verbindungstest 8.6",correct:1,total:1,percent:100,timeSeconds:0,errors:"",userAgent:navigator.userAgent})});
    st.textContent="Test gesendet. Prüfe im Google Sheet, ob eine TEST-Zeile angekommen ist.";
    st.className="small saveOk";
  }catch(e){
    st.textContent="Test fehlgeschlagen. Prüfe Veröffentlichung des Apps Scripts.";
    st.className="small saveBad";
  }
}
initialConfig();
