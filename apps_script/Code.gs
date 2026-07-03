// DeutschQuest 7.0 – Google Apps Script Tracking Perfect
// Hoja recomendada: una Google Sheet nueva.
// Extensiones > Apps Script > pega este código.
// Implementar > Nueva implementación > Aplicación web.
// Ejecutar como: Yo.
// Acceso: Cualquier usuario.
// Copia la URL terminada en /exec y pégala en js/config.js.

const SHEET_EVENTS = "DQ7_Events";
const SHEET_SUMMARY = "DQ7_Resumen";
const SHEET_TEXTS = "DQ7_Textos";

function doGet() {
  return ContentService
    .createTextOutput("DeutschQuest 7.0 Tracking läuft.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const payload = readPayload_(e);
    const data = JSON.parse(payload || "{}");
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    appendEvent_(ss, data);
    updateSummary_(ss, data);
    if (data.type === "dsd_text_submit" || data.mode === "open_sentence") {
      appendText_(ss, data);
    }

    return json_({ok:true});
  } catch (err) {
    return json_({ok:false, error:String(err), stack: err && err.stack ? err.stack : ""});
  }
}

function readPayload_(e) {
  if (e && e.parameter && e.parameter.payload) return e.parameter.payload;
  if (e && e.postData && e.postData.contents) {
    const raw = e.postData.contents;
    if (raw.indexOf("payload=") === 0) {
      return decodeURIComponent(raw.replace(/^payload=/, "").replace(/\+/g, " "));
    }
    return raw;
  }
  return "{}";
}

function appendEvent_(ss, d) {
  const sh = getSheet_(ss, SHEET_EVENTS, [
    "Serverzeit","Eventzeit","Event_ID","Session_ID","Typ","Version","Kurs",
    "Name","Klasse","Thema_ID","Thema","Aktivität","Wort_DE","Lösung_ES",
    "Antwort","Richtig","Versuch_Nr","Score_nachher","Prozent","Dauer_Sek",
    "Details","UserAgent"
  ]);
  sh.appendRow([
    new Date(), d.created_at || "", d.event_id || "", d.session_id || "", d.type || "",
    d.version || "", d.course || "", d.student_name || "", d.student_class || "",
    d.topic_id || "", d.topic_title || "", d.activity_id || "",
    d.item_de || "", d.correct_answer || d.item_es || "", d.student_answer || "",
    bool_(d.is_correct), d.attempt_number || "", d.score_after || "",
    d.percent || "", d.duration_seconds || "", d.detail || d.mode || "", d.user_agent || ""
  ]);
}

function updateSummary_(ss, d) {
  if (d.type !== "activity_finish") return;
  const sh = getSheet_(ss, SHEET_SUMMARY, [
    "Letzte Aktualisierung","Name","Klasse","Session_ID","Thema","Aktivität",
    "Score","Versuche","Prozent","Dauer_Sek","Version"
  ]);
  sh.appendRow([
    new Date(), d.student_name || "", d.student_class || "", d.session_id || "",
    d.topic_title || "", d.activity_id || "", d.score || 0, d.attempts || 0,
    d.percent || 0, d.duration_seconds || 0, d.version || ""
  ]);
}

function appendText_(ss, d) {
  const sh = getSheet_(ss, SHEET_TEXTS, [
    "Serverzeit","Name","Klasse","Session_ID","Thema","Aktivität","Wort","Text/Antwort","Verwendete Wörter","Event_ID"
  ]);
  sh.appendRow([
    new Date(), d.student_name || "", d.student_class || "", d.session_id || "",
    d.topic_title || "", d.activity_id || "", d.item_de || "",
    d.text || d.student_answer || "", d.used_words || "", d.event_id || ""
  ]);
}

function getSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const first = sh.getRange(1, 1, 1, headers.length).getValues()[0];
  const empty = first.every(v => v === "");
  if (empty) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, headers.length);
  }
  return sh;
}

function bool_(v) {
  if (v === true) return "TRUE";
  if (v === false) return "FALSE";
  return "";
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
