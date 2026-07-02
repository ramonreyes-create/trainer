function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DeutschQuest_Abgaben') || ss.insertSheet('DeutschQuest_Abgaben');
  const raw = e.postData && e.postData.contents ? e.postData.contents : '{}';
  const data = JSON.parse(raw);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Kind', 'Version', 'Name', 'Kurs', 'Level', 'Thema',
      'StartedAt', 'FinishedAt', 'TotalSeconds', 'Score', 'TotalCorrectable',
      'Percent', 'ActivitiesCount', 'DetailsJSON'
    ]);
  }

  const percent = data.totalCorrectable ? Math.round((data.score / data.totalCorrectable) * 100) : 0;
  sheet.appendRow([
    new Date(), data.kind || 'final', data.version || '7.0', data.studentName || '',
    data.courseName || '', data.level || '', data.topicTitle || data.lessonTitle || '', data.startedAt || '',
    data.finishedAt || '', data.totalSeconds || 0, data.score || 0, data.totalCorrectable || 0,
    percent, (data.activities || []).length, JSON.stringify(data)
  ]);

  return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DeutschQuest_Abgaben');
  if (!sheet || sheet.getLastRow() < 2) {
    return ContentService.createTextOutput(JSON.stringify({rows:[]}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const rows = values.map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    try {
      return JSON.parse(obj.DetailsJSON || '{}');
    } catch (err) {
      return obj;
    }
  });
  return ContentService.createTextOutput(JSON.stringify({rows: rows}))
    .setMimeType(ContentService.MimeType.JSON);
}
