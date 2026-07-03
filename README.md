# DeutschQuest DSD II 7.0 – Tracking Perfect

Versión optimizada para GitHub Pages.

## Archivos importantes
- `index.html`: inicio y selección de temas.
- `topic.html`: 8 actividades por tema.
- `teacher.html`: panel docente e instrucciones.
- `js/config.js`: aquí va la URL del Apps Script.
- `js/tracking.js`: sistema de tracking completo.
- `apps_script/Code.gs`: código para Google Sheets.
- `data/topics.json`: vocabulario DSD II.

## Configuración rápida
1. Sube toda la carpeta a GitHub.
2. Crea una Google Sheet.
3. En la Sheet: Extensiones > Apps Script.
4. Pega `apps_script/Code.gs`.
5. Implementar > Nueva implementación > Aplicación web.
6. Ejecutar como: Yo.
7. Acceso: Cualquier usuario.
8. Copia la URL `/exec`.
9. En `js/config.js`, pega la URL en `SCRIPT_URL` y cambia `DEMO_MODE` a `false`.

## Qué registra
- `profile_saved`
- `index_open`
- `topic_open`
- `topic_page_open`
- `activity_start`
- `answer`
- `dsd_text_submit`
- `activity_finish`
- `page_hidden`
- `page_visible`
- `page_unload`

## Hojas creadas automáticamente
- `DQ7_Events`: cada acción detallada.
- `DQ7_Resumen`: resumen por actividad terminada.
- `DQ7_Textos`: respuestas abiertas y textos DSD.
