# DeutschQuest 7.0 – Themen + 8 Aktivitäten

Versión corregida funcional.

## Flujo de la alumna

1. Escribe su nombre.
2. Escribe libremente el curso o grupo.
3. Elige un tema de vocabulario.
4. Elige libremente una de las 8 actividades:
   1. Flashcards
   2. Multiple Choice Deutsch → Spanisch
   3. Multiple Choice Spanisch → Deutsch
   4. Schreiben Deutsch
   5. Übersetzen ins Spanische
   6. Zuordnen
   7. Lückensätze
   8. Freier Text
5. Puede hacer las actividades en cualquier orden.
6. Al final se envía la entrega completa.

## Registro

La entrega guarda:

- nombre
- curso abierto
- tema elegido
- tiempo total
- puntaje
- actividades realizadas
- respuestas de cada ítem
- texto libre completo

## Google Sheets

Pega la URL de tu Web App en:

`js/config.js`

```js
WEBAPP_URL: "https://script.google.com/macros/s/XXXXX/exec"
```

Modo recomendado:

```js
SEND_MODE: "final"
```

Modo con respaldo después de cada actividad:

```js
SEND_MODE: "checkpoint"
```

## Archivos para subir a GitHub

Sube todo el contenido de esta carpeta:

- index.html
- student.html
- teacher.html
- css/
- js/
- data/
- apps-script/
- docs/
