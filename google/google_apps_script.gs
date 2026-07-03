function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents || "{}");

  var summary = ss.getSheetByName("Ergebnisse");
  if (!summary) {
    summary = ss.insertSheet("Ergebnisse");
    summary.appendRow(["Timestamp","Name","Kurs","Aktuelles Thema","Aktuelle Phase","Richtig aktuell","Total aktuell","Prozent aktuell","Gesamtzeit Sekunden","Events","Antworten","Richtig gesamt","Falsch/Offen gesamt","Themen","Phasen","Tabwechsel","Vollbild verlassen","UserAgent"]);
  }
  var sum = data.summary || {};
  summary.appendRow([
    data.timestamp || new Date(), data.name || "", data.course || "", data.theme || "", data.mode || "",
    data.correct || 0, data.total || 0, data.percent || 0, data.timeSeconds || 0,
    sum.events || (data.events ? data.events.length : 0), sum.answers || 0, sum.ok || 0, sum.wrong || 0,
    sum.themes || 0, sum.modes || 0, data.focusLostCount || 0, data.fullscreenExitCount || 0, data.userAgent || ""
  ]);

  var log = ss.getSheetByName("Aktivitaetsprotokoll");
  if (!log) {
    log = ss.insertSheet("Aktivitaetsprotokoll");
    log.appendRow(["Session","Zeit","Sekunden","Name","Kurs","Event","Thema","Phase","Detail_JSON"]);
  }
  var sessionId = data.sessionId || (data.events && data.events[0] && data.events[0].phaseId) || Utilities.getUuid();
  (data.events || []).forEach(function(ev){
    log.appendRow([sessionId, ev.at || "", ev.secondsFromStart || 0, data.name || "", data.course || "", ev.type || "", ev.theme || "", ev.mode || "", JSON.stringify(ev.detail || {})]);
  });

  return ContentService.createTextOutput(JSON.stringify({status:"ok"})).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  return ContentService.createTextOutput("DeutschQuest DSD II Logger aktiv – Registro total");
}
