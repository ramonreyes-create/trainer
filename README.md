# DeutschQuest DSD II 7.0 – GitHub Ready

Esta versión está basada directamente en la versión 6.3 enviada por Ramón.

## Qué mantiene de la 6.3

- Vocabulario DSD II desde `data/themes.js`.
- Selección de tema.
- Actividades de vocabulario por tema.
- Interfaz visual y estructura base de GitHub Pages.
- Configuración con `js/config.js`.
- Integración con Google Sheets mediante Apps Script.

## Qué mejora en la 7.0

- El curso queda abierto: la alumna escribe libremente el curso.
- Las actividades quedan separadas como 8 actividades:
  1. Zuordnen
  2. Wort schreiben
  3. Wortfamilien
  4. Verben mit Präpositionen
  5. Memory
  6. Wortkreuzrätsel
  7. Lückentext
  8. Meinung schreiben
- Se guarda un historial local completo de lo que hace la alumna.
- Al presionar **Kompletten Bericht senden**, se envía el reporte completo a Google Sheets.
- El modo `checkpoint` permite enviar respaldo automático después de cada comprobación.

## Google Sheets

1. Crea un Google Sheet.
2. Abre Extensiones → Apps Script.
3. Copia el contenido de `google/google_apps_script.gs`.
4. Implementa como Web-App.
5. Copia la URL terminada en `/exec`.
6. Pégala en `js/config.js`, en `sheetUrl`.

El Apps Script crea dos hojas:

- `Resumen`: resumen general de cada envío.
- `Detalle`: cada respuesta, cada intento, Memory y textos libres.

## Subida a GitHub

Sube el contenido de esta carpeta, no el ZIP completo.

Archivos/carpetas necesarios:

- `index.html`
- `student.html`
- `teacher.html`
- `css/`
- `js/`
- `data/`
- `google/`

## Importante

Después de subir a GitHub, abre primero `teacher.html`, prueba la conexión con Google Sheets y luego revisa `student.html`.
