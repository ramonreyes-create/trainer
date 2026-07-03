function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = {};
  try {
    data = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    data = { parseError: String(err), raw: e.postData ? e.postData.contents : '' };
  }

  var summary = ss.getSheetByName('Ergebnisse');
  if (!summary) {
    summary = ss.insertSheet('Ergebnisse');
    summary.appendRow(['Timestamp','SessionId','Name','Kurs','Thema','Aktuelle Phase','Richtig','Total','Prozent','Zeit gesamt (Sek.)','Zeit Phase (Sek.)','Fehler','Freie Texte','Version','UserAgent']);
  }
  summary.appendRow([
    data.timestamp || new Date(),
    data.sessionId || '',
    data.name || '',
    data.course || '',
    data.theme || '',
    data.mode || '',
    data.correct || 0,
    data.total || 0,
    data.percent || 0,
    data.timeSeconds || 0,
    data.phaseTimeSeconds || 0,
    data.errors || '',
    JSON.stringify(data.openTexts || []),
    data.appVersion || '',
    data.userAgent || ''
  ]);

  var log = ss.getSheetByName('Aktivitaetsprotokoll');
  if (!log) {
    log = ss.insertSheet('Aktivitaetsprotokoll');
    log.appendRow(['Timestamp','SessionId','Name','Kurs','Thema','Übungsform','Ereignis','Details']);
  }
  var events = data.events || [];
  if (events.length === 0) {
    log.appendRow([data.timestamp || new Date(), data.sessionId || '', data.name || '', data.course || '', data.theme || '', data.mode || '', 'summary_only', JSON.stringify(data)]);
  } else {
    events.forEach(function(ev){
      log.appendRow([
        ev.time || data.timestamp || new Date(),
        data.sessionId || '',
        data.name || '',
        data.course || '',
        ev.theme || data.theme || '',
        ev.modeLabel || ev.mode || data.mode || '',
        ev.type || '',
        JSON.stringify(ev)
      ]);
    });
  }

  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput('DeutschQuest DSD II Logger 8.6 aktiv');
}
