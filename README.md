# DeutschQuest 7.0 Funcional

Versión funcional para GitHub Pages.

## Archivos principales
- `index.html` – portada
- `student.html` – modo alumna
- `teacher.html` – modo profesor
- `js/config.js` – aquí se pega la URL de Google Apps Script
- `apps-script/Code.gs` – código para Google Sheets

## Qué mejora la versión 7.0
- Campo Curso abierto: la alumna escribe lo que quiera.
- Registro completo de respuestas, no solo la última actividad.
- Historial con hora, actividad, pregunta, respuesta, solución, correcto/incorrecto, intentos y tiempo.
- Guardado local automático en el navegador.
- Envío final completo a Google Sheets.
- Autosend opcional después de cada actividad.
- Panel docente más claro con filtros por curso, alumna y unidad.

## Configuración Google Sheets
1. Crear una Google Sheet nueva.
2. Ir a Extensiones → Apps Script.
3. Pegar el contenido de `apps-script/Code.gs`.
4. Implementar como Web App.
5. Acceso: Cualquiera.
6. Copiar la URL de la Web App.
7. Pegarla en `js/config.js` en `WEBAPP_URL`.

## Subir a GitHub
Sube la carpeta completa al repositorio. No subas solo los HTML, porque necesitan las carpetas `css`, `js`, `data` y `apps-script`.
