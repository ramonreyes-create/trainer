function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents || "{}");

  var resumen = ss.getSheetByName("Resumen");
  if (!resumen) {
    resumen = ss.insertSheet("Resumen");
    resumen.appendRow(["Timestamp","SessionId","Version","Name","Kurs","Thema","Modo","Richtig","Total","Prozent","ZeitSekunden","AnzahlDetails","UserAgent"]);
  }
  var details = data.details || [];
  resumen.appendRow([
    data.timestamp || new Date(),
    data.sessionId || "",
    data.appVersion || "7.0",
    data.name || "",
    data.course || "",
    data.theme || "",
    data.mode || "",
    data.correct || 0,
    data.total || 0,
    data.percent || 0,
    data.timeSeconds || 0,
    details.length,
    data.userAgent || ""
  ]);

  var detalle = ss.getSheetByName("Detalle");
  if (!detalle) {
    detalle = ss.insertSheet("Detalle");
    detalle.appendRow(["Timestamp","SessionId","Name","Kurs","Thema","Actividad","Item","Pregunta","Respuesta","Esperado","Correcta","TiempoSegundos","Movimientos"]);
  }
  details.forEach(function(d){
    detalle.appendRow([
      d.timestamp || data.timestamp || new Date(),
      d.sessionId || data.sessionId || "",
      d.name || data.name || "",
      d.course || data.course || "",
      d.theme || data.theme || "",
      d.activity || d.mode || "",
      d.item || "",
      d.prompt || "",
      d.answer || "",
      d.expected || "",
      d.correct === true ? "SI" : (d.correct === false ? "NO" : "TEXTO"),
      d.timeSeconds || "",
      d.moves || ""
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({status:"ok"})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput("DeutschQuest DSD II 7.0 Logger aktiv");
}
