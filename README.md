# DeutschQuest DSD II 8.6 Final Funcional – GitHub Ready

Esta versión está preparada para GitHub Pages y mejora la versión 6.2.

## Archivos que debes subir a GitHub

Sube el contenido completo de esta carpeta:

- `index.html`
- `student.html`
- `teacher.html`
- `css/`
- `js/`
- `data/`
- `google/`
- `README.md`
- `CONFIGURAR_ANTES_DE_SUBIR.txt`

No subas solo el archivo ZIP. Deben quedar los archivos visibles en la raíz del repositorio.

## Configuración de Google Sheets

1. Crea un Google Sheet.
2. Abre Extensiones → Apps Script.
3. Pega el código de `google/google_apps_script.gs`.
4. Publica como Web-App.
5. Copia la URL que termina en `/exec`.
6. Abre `js/config.js`.
7. Pega la URL en `sheetUrl`.

Ejemplo:

```js
sheetUrl: "https://script.google.com/macros/s/TU_URL/exec",
```

## Uso

- Las alumnas entran en `student.html`.
- El profesor usa `teacher.html` solo para preparar y comprobar la configuración.
- `index.html` es la portada general.

## Novedades 6.3

- Portada más clara.
- Lehrer-Modus más ordenado.
- Generador de `config.js`.
- Advertencia clara de que el Lehrer-Modus no modifica GitHub automáticamente.
- Versión coherente 6.3 en HTML y JS.
