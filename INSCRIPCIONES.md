# Inscripciones en línea

El formulario de la sección 07 guarda cada inscripción en una **hoja de cálculo
de Google**, en tiempo real. No hace falta servidor propio, base de datos ni
plan de pago.

Las coordinadoras abren la hoja y ven la lista completa: pueden filtrar por
comisión, ordenar, marcar aceptados y descargarla como Excel cuando quieran.

---

## Por qué esta vía y no otra

| Opción | Costo | Límite | Dónde quedan los datos |
|---|---|---|---|
| **Google Sheets + Apps Script** ← elegida | Gratis | Sin límite práctico | Hoja de cálculo viva, compartible |
| Netlify Forms | Gratis | **100 envíos al mes** | Panel de Netlify, se exporta a CSV |
| Formspree y similares | Gratis | 50 envíos al mes | Panel del proveedor |
| Backend propio | Hosting | — | Habría que construirlo y mantenerlo |

Para un modelo con cientos de delegados, el tope de 100 envíos mensuales de
Netlify se queda corto. Google Sheets no tiene ese problema y además entrega
justo lo que se pidió: una hoja tipo Excel que se llena sola.

---

## Montarlo, paso a paso

Toma unos diez minutos y se hace una sola vez.

### 1 · Crear la hoja de cálculo

1. Entrar a [sheets.new](https://sheets.new) con la cuenta de Google de NORMUN
   (mejor una cuenta de la institución que una personal).
2. Ponerle nombre: **NORMUN — Inscripciones**.

> **Esto es lo más importante de toda la guía.** Usar una cuenta de Google que
> sea de la institución, no la personal de quien monta la página. La hoja, el
> script y los datos quedan colgando de esa cuenta: si es la personal de
> alguien que después se va, el formulario deja de funcionar y las
> inscripciones se quedan encerradas en un Drive ajeno.
>
> Si ya se creó con una cuenta personal, se puede transferir: *Compartir →
> agregar la cuenta institucional como editora → los tres puntos junto a su
> nombre → Transferir propiedad*.

### 2 · Abrir el editor de scripts

En el menú de la hoja: **Extensiones → Apps Script**.

Se abre una pestaña con un archivo `Código.gs` que trae una función vacía.
Borrar todo lo que haya y pegar el código de la sección siguiente.

### 3 · Pegar este código

```javascript
/**
 * NORMUN — Recepción de inscripciones
 * Recibe los envíos del formulario y los escribe en la hoja.
 */

const HOJA = 'Inscripciones';

const ENCABEZADOS = [
  'Recibido', 'Nombre', 'Documento', 'Nacimiento', 'Correo', 'Teléfono',
  'Institución', 'Grado', 'Comisión 1', 'Comisión 2', 'Experiencia',
  'Idioma', 'Comentarios', 'Autorización'
];

// Para recibir un aviso por correo con cada inscripción,
// escribir aquí la dirección. Dejar '' para no recibir nada.
const AVISAR_A = '';

function doPost(e) {
  const candado = LockService.getScriptLock();
  candado.waitLock(30000);

  try {
    const hoja = prepararHoja();
    const d = (e && e.parameter) || {};

    // Trampa anti-spam: si el campo oculto viene lleno, es un robot.
    if (d.website) return respuesta('ignorado');

    // Evita filas duplicadas si alguien toca "enviar" dos veces.
    if (esDuplicado(hoja, d.documento)) return respuesta('duplicado');

    hoja.appendRow([
      new Date(),
      d.nombre       || '',
      d.documento    || '',
      d.nacimiento   || '',
      d.correo       || '',
      d.telefono     || '',
      d.institucion  || '',
      d.grado        || '',
      d.comision1    || '',
      d.comision2    || '',
      d.experiencia  || '',
      d.idioma       || '',
      d.comentarios  || '',
      d.autorizacion ? 'Sí' : 'No'
    ]);

    if (AVISAR_A) avisar(d);
    return respuesta('ok');

  } catch (err) {
    return respuesta('error: ' + err);
  } finally {
    candado.releaseLock();
  }
}

/** Crea la hoja y los encabezados la primera vez. */
function prepararHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA);

  if (hoja.getLastRow() === 0) {
    hoja.appendRow(ENCABEZADOS);
    const cabecera = hoja.getRange(1, 1, 1, ENCABEZADOS.length);
    cabecera.setFontWeight('bold')
            .setBackground('#1B7030')
            .setFontColor('#FFFFFF');
    hoja.setFrozenRows(1);
    hoja.autoResizeColumns(1, ENCABEZADOS.length);
  }
  return hoja;
}

/** ¿Ya llegó este documento en los últimos dos minutos? */
function esDuplicado(hoja, documento) {
  if (!documento) return false;
  const filas = hoja.getLastRow();
  if (filas < 2) return false;

  const desde = Math.max(2, filas - 20);
  const datos = hoja.getRange(desde, 1, filas - desde + 1, 3).getValues();
  const limite = Date.now() - 2 * 60 * 1000;

  return datos.some(function (f) {
    return String(f[2]).trim() === String(documento).trim() &&
           f[0] instanceof Date && f[0].getTime() > limite;
  });
}

/** Aviso por correo, si se configuró una dirección. */
function avisar(d) {
  const cuerpo =
    'Nueva inscripción a NORMUN\n\n' +
    'Nombre: '      + (d.nombre || '-')      + '\n' +
    'Documento: '   + (d.documento || '-')   + '\n' +
    'Correo: '      + (d.correo || '-')      + '\n' +
    'Teléfono: '    + (d.telefono || '-')    + '\n' +
    'Institución: ' + (d.institucion || '-') + '\n' +
    'Grado: '       + (d.grado || '-')       + '\n' +
    'Comisión 1: '  + (d.comision1 || '-')   + '\n' +
    'Comisión 2: '  + (d.comision2 || '-')   + '\n';

  MailApp.sendEmail(AVISAR_A, 'NORMUN · inscripción de ' + (d.nombre || 'delegado'), cuerpo);
}

function respuesta(estado) {
  return ContentService
    .createTextOutput(JSON.stringify({ estado: estado }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 4 · Publicarlo

1. Botón **Implementar → Nueva implementación**.
2. En el engranaje, elegir tipo **Aplicación web**.
3. Configurar así:
   - **Ejecutar como:** Yo *(la cuenta dueña de la hoja)*
   - **Quién tiene acceso:** **Cualquier persona**
4. **Implementar**. Google pide autorización la primera vez: aceptar.
   > Si aparece «Google no ha verificado esta aplicación», entrar en
   > *Configuración avanzada → Ir a (nombre del proyecto)*. Es normal: el
   > script es propio, no de un tercero.
5. Copiar la **URL de la aplicación web**. Termina en `/exec`.

> «Cualquier persona» significa que cualquiera puede *enviar* datos, no
> leerlos. La hoja sigue siendo privada.

> ### ⚠️ El error más común
>
> Si el proyecto vive en una cuenta de Google Workspace (como
> `@ensdbexcelencia.edu.co`), Google propone por defecto **«Cualquier persona
> de ensdbexcelencia.edu.co»**. Con esa opción el formulario **solo funciona
> para quien tenga cuenta del colegio y esté con la sesión abierta**: a
> cualquier otra persona, Google le devuelve una pantalla de inicio de sesión
> y la inscripción se pierde.
>
> La página detecta ese caso y muestra un error, así que nadie se va creyendo
> que quedó inscrito. Pero nadie podría inscribirse tampoco.
>
> Tiene que quedar en **«Cualquier persona»**, a secas.
>
> **Cómo comprobarlo sin instalar nada:** abrir la URL que termina en `/exec` en una
> ventana de incógnito. Si pide iniciar sesión, está mal. Si muestra un error
> de Apps Script diciendo que no encuentra `doGet`, está bien: significa que
> llegó al script sin pedir permiso.
>
> Si el administrador del Workspace del colegio no permite la opción
> «Cualquier persona», hay dos salidas: pedirle que la habilite, o crear una
> cuenta de Gmail propia de NORMUN (por ejemplo `normun.ensdb@gmail.com`) que
> quede en manos de la coordinación, no de una persona.

### 5 · Conectarlo a la página

Abrir `assets/js/main.js`, buscar la línea que dice `var ENDPOINT` (está al
comienzo del bloque 9) y pegar la URL entre las comillas:

```javascript
var ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
```

Guardar, subir los cambios, y listo.

### 6 · Probarlo

Llenar el formulario con datos falsos y confirmar que aparece la fila en la
hoja. **Siempre hacer esta prueba antes de anunciar las inscripciones.**

---

## Cómo trabajan las coordinadoras con la hoja

- **Compartirla** con las tres coordinadoras desde el botón *Compartir*.
- **Filtrar por comisión:** *Datos → Crear un filtro*, y usar la flecha de la
  columna «Comisión 1».
- **Descargar como Excel:** *Archivo → Descargar → Microsoft Excel (.xlsx)*.
- **Agregar columnas propias** al final (por ejemplo «Aceptado», «País
  asignado»). El script solo escribe las columnas A a N, así que no las toca.

> No borrar ni reordenar las columnas A a N: el script escribe siempre en ese
> orden. Las columnas nuevas van de la O en adelante.

---

## Dejar la hoja bonita (opcional)

Este script da formato a la pestaña `Inscripciones`: cabecera con los colores
institucionales, anchos de columna a medida, filas alternadas, fechas legibles,
filtro y un par de resaltados útiles.

**Se puede correr las veces que se quiera.** Borra el formato anterior antes de
aplicar el nuevo, así que no se acumula ni se duplica nada. Y no toca los datos.

### Cómo usarlo

1. En el editor de Apps Script, pegar este código **debajo** del que ya está
   (sin borrar nada de lo anterior).
2. Arriba, en el selector de funciones, elegir **`darFormato`**.
3. Botón **Ejecutar**.

No hay que volver a publicar la implementación: esto se corre a mano, no forma
parte de lo que recibe el formulario.

```javascript
/**
 * NORMUN — Formato de la hoja de inscripciones.
 * Se puede volver a correr cuando se quiera; no toca los datos.
 */
function darFormato() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Inscripciones');
  if (!hoja) {
    SpreadsheetApp.getUi().alert('No encontré la pestaña "Inscripciones".');
    return;
  }

  const VERDE  = '#2E9E42';
  const ROJO   = '#C1272D';
  const COLS   = 14;                     // de la A a la N
  const filas  = hoja.getLastRow();
  const ultima = Math.max(filas, 2);

  // --- Cabecera -------------------------------------------------------
  hoja.getRange(1, 1, 1, COLS)
      .setBackground(VERDE)
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setFontSize(10)
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('left')
      .setWrap(true);
  hoja.setRowHeight(1, 42);

  // --- Ancho de cada columna ------------------------------------------
  const anchos = [140, 220, 115, 110, 215, 120, 200, 75, 205, 205, 155, 90, 260, 110];
  anchos.forEach(function (ancho, i) { hoja.setColumnWidth(i + 1, ancho); });

  // --- Cuerpo ---------------------------------------------------------
  if (filas > 1) {
    const cuerpo = hoja.getRange(2, 1, filas - 1, COLS);
    cuerpo.setFontSize(10)
          .setVerticalAlignment('top')
          .setWrap(false);

    hoja.getRange(2, 1,  filas - 1, 1).setNumberFormat('dd/MM/yyyy  HH:mm'); // Recibido
    hoja.getRange(2, 4,  filas - 1, 1).setNumberFormat('dd/MM/yyyy');        // Nacimiento
    hoja.getRange(2, 13, filas - 1, 1).setWrap(true);                        // Comentarios
    hoja.getRange(2, 3,  filas - 1, 1).setHorizontalAlignment('left');       // Documento
    hoja.getRange(2, 8,  filas - 1, 1).setHorizontalAlignment('center');     // Grado
    hoja.getRange(2, 14, filas - 1, 1).setHorizontalAlignment('center');     // Autorización
  }

  // --- Filas alternadas (se quita la anterior para no apilar) ----------
  hoja.getBandings().forEach(function (b) { b.remove(); });
  hoja.getRange(1, 1, ultima, COLS)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);

  // --- Bordes y líneas -------------------------------------------------
  hoja.getRange(1, 1, ultima, COLS)
      .setBorder(null, null, null, null, null, true, '#E0E0E0',
                 SpreadsheetApp.BorderStyle.SOLID);

  // --- Congelar y filtrar ----------------------------------------------
  hoja.setFrozenRows(1);
  hoja.setFrozenColumns(2);              // Recibido y Nombre siempre visibles
  if (hoja.getFilter()) hoja.getFilter().remove();
  hoja.getRange(1, 1, ultima, COLS).createFilter();

  // --- Resaltados ------------------------------------------------------
  const rango = hoja.getRange(2, 1, Math.max(ultima - 1, 1), COLS);
  const reglas = [];

  // Documento repetido: casi siempre es un envío doble
  reglas.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($C2<>"", COUNTIF($C:$C,$C2)>1)')
    .setBackground('#FBE4E2')
    .setRanges([rango])
    .build());

  // Consejo de Seguridad: la comisión de alta exigencia, para verla de lejos
  reglas.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Consejo de Seguridad')
    .setBackground('#FDF0C8')
    .setRanges([hoja.getRange(2, 9, Math.max(ultima - 1, 1), 2)])
    .build());

  // Autorización
  reglas.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Sí')
    .setFontColor(VERDE).setBold(true)
    .setRanges([hoja.getRange(2, 14, Math.max(ultima - 1, 1), 1)])
    .build());

  reglas.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('No')
    .setFontColor(ROJO).setBold(true).setBackground('#FBE4E2')
    .setRanges([hoja.getRange(2, 14, Math.max(ultima - 1, 1), 1)])
    .build());

  hoja.setConditionalFormatRules(reglas);

  SpreadsheetApp.getActiveSpreadsheet()
    .toast('Formato aplicado a ' + Math.max(filas - 1, 0) + ' inscripciones.', 'NORMUN', 5);
}
```

### Qué hace, en corto

| | |
|---|---|
| **Cabecera** | Verde institucional, texto blanco, fila congelada |
| **Columnas** | Ancho a medida de cada dato, sin tener que ajustarlas a mano |
| **Fechas** | `07/09/2026 22:22` en vez del formato crudo |
| **Filas** | Alternadas en gris muy suave, para seguir la línea con la vista |
| **Congelado** | Fecha y nombre quedan fijos al desplazarse a la derecha |
| **Filtro** | Listo en la cabecera, para filtrar por comisión o institución |
| **Documento repetido** | Fila en rosa: casi siempre es un envío doble |
| **Consejo de Seguridad** | Resaltado en amarillo, por ser la comisión de alta exigencia |
| **Autorización** | «Sí» en verde, «No» en rojo y con fondo |

### Resumen por comisión

Esta segunda función crea una pestaña aparte con el conteo de inscripciones por
comisión. Se corre igual que la anterior, eligiendo **`hacerResumen`**.

Va en **otra pestaña** a propósito: así no interfiere con las columnas donde
escribe el formulario.

```javascript
/** Cuenta inscripciones por comisión en una pestaña aparte. */
function hacerResumen() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const datos = libro.getSheetByName('Inscripciones');
  if (!datos || datos.getLastRow() < 2) return;

  const COMISIONES = [
    'Desarme y Seguridad Internacional',
    'Alto Comisionado de la ONU para los Refugiados',
    'ONU Mujeres',
    'UNESCO',
    'Consejo de Seguridad',
    'Comisión Colombia'
  ];

  let hoja = libro.getSheetByName('Resumen');
  if (hoja) hoja.clear(); else hoja = libro.insertSheet('Resumen');

  const filas = datos.getLastRow() - 1;
  const primera = datos.getRange(2, 9, filas, 1).getValues().flat();
  const segunda = datos.getRange(2, 10, filas, 1).getValues().flat();

  const tabla = [['Comisión', 'Primera opción', 'Segunda opción', 'Total']];
  COMISIONES.forEach(function (c) {
    const p = primera.filter(function (v) { return v === c; }).length;
    const s = segunda.filter(function (v) { return v === c; }).length;
    tabla.push([c, p, s, p + s]);
  });
  tabla.push(['TOTAL DE INSCRITOS', filas, '', '']);

  hoja.getRange(1, 1, tabla.length, 4).setValues(tabla);
  hoja.getRange(1, 1, 1, 4)
      .setBackground('#2E9E42').setFontColor('#FFFFFF').setFontWeight('bold');
  hoja.getRange(tabla.length, 1, 1, 4).setFontWeight('bold');
  hoja.setColumnWidth(1, 320);
  hoja.setFrozenRows(1);
}
```

> El resumen es una foto del momento: no se actualiza solo. Hay que volver a
> correr `hacerResumen` cuando se quiera la cifra al día.

---

## Cosas que conviene saber

**La confirmación en pantalla sí verifica el servidor.** El despliegue de Apps
Script devuelve la cabecera `Access-Control-Allow-Origin: *`, así que la página
puede leer la respuesta del script. Solo muestra «Inscripción recibida» cuando
el script confirma que escribió la fila. Si algo falla —el script devuelve
error, se cae la red, o el despliegue quedó restringido y Google responde con
una pantalla de login— la persona ve un mensaje de error, no un éxito falso.

Probado con las cinco situaciones: respuesta 500, error del script, página de
login de Google, red caída y envío duplicado. Las cuatro primeras muestran
error; el duplicado se trata como éxito, porque la persona ya está registrada.

> Si en el futuro se cambia el despliegue y deja de enviar cabeceras CORS, el
> formulario empezará a mostrar error en todos los envíos aunque las filas se
> escriban. En ese caso hay que revisar que la implementación siga como
> «Cualquier persona».

**Si se edita el código del script**, hay que volver a *Implementar → Gestionar
implementaciones → editar → Nueva versión*. Si no, sigue corriendo el código
viejo.

**Protección de datos.** El formulario recoge datos de menores de edad, así que
incluye una casilla de autorización según la Ley 1581 de 2012 y una nota
pidiendo aval del acudiente. Vale la pena que la institución revise ese texto y
defina quién es el responsable del tratamiento, cuánto tiempo se guardan los
datos y a quién se le da acceso a la hoja.

---

## Si algo falla

| Síntoma | Causa probable |
|---|---|
| Sale «el formulario todavía no está conectado» | Falta pegar la URL en `ENDPOINT` |
| Se envía pero no aparece la fila | **Lo más probable: la implementación quedó restringida al dominio del colegio en vez de «Cualquier persona».** Comprobar abriendo la URL en incógnito. También puede ser que se editó el script sin publicar versión nueva |
| Llegan filas vacías | Puede ser un robot: revisar que el campo trampa `website` siga en el HTML |
| Llegan duplicados | El bloqueo cubre dos minutos; más allá de eso son envíos reales |

---

## Alternativa más simple, si algún día se prefiere

**Netlify Forms** no necesita ningún script: basta agregar dos atributos al
formulario y Netlify guarda todo en su panel.

```html
<form id="inscripcionForm" name="inscripciones" method="POST"
      data-netlify="true" netlify-honeypot="website">
  <input type="hidden" name="form-name" value="inscripciones">
  ...
</form>
```

Y en `main.js` habría que dejar que el formulario se envíe solo, sin el `fetch`.

Es más fácil de montar, pero el plan gratuito solo admite **100 envíos al mes**.
