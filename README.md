# DeutschQuest DSD II 8.1 – Visual + Registro Total

Base: versión 6.3.

Esta versión conserva intacto `data/themes.js` de la 6.3 y agrega una interfaz más atractiva junto con un sistema de registro completo.

## Registra

- nombre y curso de la alumna
- tema elegido
- fase/actividad realizada
- respuestas revisadas
- aciertos y errores
- textos abiertos escritos
- tiempo total
- cambio de pestaña
- salida de pantalla completa
- historial completo en Google Sheets

## Google Sheets

Usar el archivo `google/google_apps_script.gs`. El script crea dos hojas:

1. `Ergebnisse`: resumen por envío.
2. `Aktivitaetsprotokoll`: historial completo evento por evento.

Luego copiar la URL `/exec` en `js/config.js`.
