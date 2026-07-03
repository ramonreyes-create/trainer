function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents || '{}');

  var resumen = ss.getSheetByName('Ergebnisse');
  if (!resumen) {
    resumen = ss.insertSheet('Ergebnisse');
    resumen.appendRow(['Timestamp','Version','Name','Kurs','Thema','Übungsform','Richtig','Total','Prozent','ZeitSekunden','ZeitAktivitätSekunden','FokusVerloren','FullscreenVerlassen','Fehler','Freitext','UserAgent']);
  }
  var freitext = '';
  if (data.openText && data.openText.length) {
    freitext = data.openText.map(function(x){ return (x.part || '') + ': ' + (x.text || ''); }).join(' || ');
  }
  resumen.appendRow([
    data.timestamp || new Date(), data.appVersion || '', data.name || '', data.course || '', data.theme || '', data.mode || '',
    data.correct || 0, data.total || 0, data.percent || 0, data.timeSeconds || 0, data.activityTimeSeconds || 0,
    data.focusLossCount || 0, data.fullscreenExitCount || 0, data.errors || '', freitext, data.userAgent || ''
  ]);

  var prot = ss.getSheetByName('Aktivitaetsprotokoll');
  if (!prot) {
    prot = ss.insertSheet('Aktivitaetsprotokoll');
    prot.appendRow(['SessionTimestamp','EventTimestamp','Sekunden','Name','Kurs','Thema','Übungsform','EventTyp','Aktivität','Frage','Antwort','RichtigeAntwort','Korrekt','DetailsJSON']);
  }
  var protocol = data.protocol || [];
  protocol.forEach(function(ev){
    var d = ev.detail || {};
    prot.appendRow([
      data.timestamp || '', ev.timestamp || '', ev.secondsFromStart || 0, data.name || ev.name || '', data.course || ev.course || '',
      ev.theme || data.theme || '', ev.mode || data.mode || '', ev.type || '', d.activity || '', d.question || '', d.answer || '', d.correctAnswer || '',
      (d.correct === true ? 'TRUE' : (d.correct === false ? 'FALSE' : '')), JSON.stringify(d)
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  return ContentService.createTextOutput('DeutschQuest DSD II Logger aktiv');
}
