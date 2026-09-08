# NORMUN — Sitio web

Página web del **Modelo de Naciones Unidas de la Escuela Normal Superior del
Distrito de Barranquilla**.

Sitio estático: HTML, CSS y JavaScript puro. Sin frameworks, sin dependencias,
sin proceso de compilación. Se puede publicar tal cual en cualquier hosting.

---

## Paleta institucional

Todos los colores se definen en un solo bloque, al inicio de
`assets/css/styles.css` (sección «TOKENS»). Cambiar un valor ahí actualiza
la página entera.

Los colores salen del logo: rama izquierda roja, rama derecha verde, base
amarilla, todo sobre blanco.

| Token | Valor | Uso |
|---|---|---|
| `--green` / `--green-soft` / `--green-deep` | `#2E9E42` / `#6BCC79` / `#1B7030` | Verde del logo |
| `--yellow` / `--yellow-soft` / `--yellow-deep` | `#F0C33C` / `#F8D96E` / `#C39516` | Amarillo del logo |
| `--red` / `--red-soft` / `--red-deep` | `#C1272D` / `#E87A72` / `#8E1A20` | Rojo del logo |
| `--green-ink` / `--yellow-ink` / `--red-ink` | `#1B7030` / `#8A6710` / `#A81F26` | **Versiones legibles como texto sobre claro** |
| `--bg` / `--bg-2` / `--bg-3` / `--surface` | `#FBFAF4` / `#F4F2E8` / `#EDEADC` / `#FFF` | Superficies claras |
| `--ink` | `#0A0F0C` | Superficie oscura |
| `--tricolor` | degradado | Franja rojo-amarillo-verde, en el orden del logo |

### La página es clara de principio a fin

El inicio también es claro, a propósito: si el hero fuera oscuro, el paso al
cuerpo de la página sería un corte brusco. Así la lectura fluye sin saltos.

El oscuro aparece sólo como **puntuación**, en bloques sueltos que destacan
sobre el papel: la cita de la sección 01, el panel de roles, la tarjeta del
discurso de entrada, la sección de Inscripción y el pie de página.

Esos bloques llevan la clase `.on-dark`, que **sólo redefine los tokens de
superficie y texto**. Todos los componentes se adaptan solos, sin reglas
duplicadas.

El ritmo de fondos queda así:

| Zona | Fondo |
|---|---|
| Hero | `#FFF` → `#FDFCF7`, con lavados tricolor |
| Ticker | `#EDEADC` + franjas tricolor |
| 01 · 03 | `#FBFAF4` |
| 02 · 04 · 06 | `#F4F2E8` |
| 05 Documentos | `#FFFFFF` puro |
| 07 · pie | Oscuro |

### Ojo con el amarillo

Sobre fondo claro, el amarillo puro no tiene contraste suficiente para texto.
Por eso existen `--green-ink`, `--yellow-ink` y `--red-ink`: son las versiones
legibles. La regla es simple:

- **Relleno, borde, barra, icono** → color puro (`--yellow`)
- **Texto** → versión ink (`--yellow-ink`)

Dentro de `.on-dark`, las variables ink se reasignan solas a las versiones
claras, así que el mismo componente funciona en ambos mundos.

Todas las combinaciones de texto verificadas pasan WCAG AA (mínimo 4.5:1).

**Cada sección tiene su color y van rotando:**

| Sección | Acento |
|---|---|
| 01 El Modelo | Verde |
| 02 Comisiones | Amarillo |
| 03 Roles | Rojo |
| 04 Procedimiento | Verde |
| 05 Documentos | Blanco puro, enmarcado en tricolor |
| 06 Equipo | Amarillo |
| 07 Inscripción | Los tres, sobre oscuro |

Ese acento controla el número de sección, su línea, los iconos, los bordes y los
estados activos, todo con la variable `--acc`. Cambiar una línea reasigna el
color de una sección entera.

**Dentro de las secciones los colores también rotan:** los tres pilares, las
cinco reglas de orden, los tres tipos de debate, los cinco puntos, las once
mociones, las seis comisiones, las tres coordinadoras y los cuatro pasos de
inscripción van alternando verde, amarillo y rojo.

**Dónde aparecen los tres juntos:** barra de progreso del scroll, preloader,
bordes del ticker, marco de la sección de Documentos, escudo del documento,
tarjeta del formulario, borde del menú móvil, franja superior de
Inscripción y franja del pie de página.

### El logo

Se carga desde `assets/img/logo-normun.png` y aparece en tres lugares: el
preloader (rodeado de un anillo tricolor que gira), el menú y el pie de página.
En el menú y el pie va dentro de un **disco blanco**, que es su contexto
natural, así que da igual si el archivo trae fondo blanco o transparencia.

También se usa como icono de pantalla de inicio (`apple-touch-icon`) y como
imagen de vista previa al compartir el enlace.

Si el archivo llegara a faltar, la página muestra automáticamente un emblema
SVG de respaldo con la misma estructura (globo de la ONU en proyección
azimutal, rama izquierda roja, rama derecha verde).

> El archivo actual mide 285 × 285 px, suficiente para todos los tamaños en
> que se usa. Si aparece una versión más grande o en `.svg`, vale la pena
> reemplazarla — se vería más nítida en pantallas de alta densidad.

---

## Estructura

```
normun/
├─ index.html            Toda la página (una sola vista, navegación por anclas)
├─ server.js             Servidor local para verla en el navegador
├─ assets/
│  ├─ css/styles.css     Diseño completo
│  ├─ js/main.js         Animaciones, globo, pestañas, roles, formulario
│  └─ img/               Logo y otras imágenes (ver assets/img/LEEME.txt)
├─ INSCRIPCIONES.md     Cómo conectar el formulario a Google Sheets
└─ README.md
```

## Ver la página en local

```bash
node server.js
```

Luego abrir `http://localhost:5175`.

> Abrir `index.html` con doble clic también funciona, pero se recomienda el
> servidor: algunos navegadores bloquean recursos locales con `file://`.

## Publicar en Netlify

No hay nada que compilar. El archivo `netlify.toml` ya deja configurada la
carpeta a publicar, las cabeceras de seguridad y la caché.

**Opción rápida — arrastrar la carpeta**

1. Entrar a [app.netlify.com](https://app.netlify.com) y crear una cuenta.
2. En «Sites», arrastrar la carpeta `normun` completa sobre la zona de
   «Deploy manually».
3. Queda publicada en una URL tipo `nombre-aleatorio.netlify.app`, que se puede
   cambiar en *Site configuration → Change site name*.

Para actualizar, se vuelve a arrastrar la carpeta. Sencillo, pero manual.

**Opción recomendada — conectar un repositorio**

1. Subir la carpeta a un repositorio de GitHub.
2. En Netlify: *Add new site → Import an existing project → GitHub*.
3. Dejar en blanco el «build command» y poner `.` como «publish directory»
   (o simplemente aceptar lo que lee de `netlify.toml`).

Así cada cambio que se suba a GitHub se publica solo.

### Archivos que no hacen falta en producción

`server.js` y `README.md` son herramientas de desarrollo. No estorban ni
exponen nada, pero se pueden borrar de la copia que se sube si se prefiere
dejarlo limpio. `assets/img/LEEME.txt` igual.

### Después del primer despliegue

Cambiar la etiqueta `og:image` de `index.html` a la URL completa, para que la
vista previa se vea bien al compartir por WhatsApp o Instagram:

```html
<meta property="og:image" content="https://TU-SITIO.netlify.app/assets/img/logo-normun.png">
```

## Traspaso: cuentas que deben ser de la institución

El sitio no depende de ningún servidor propio, pero sí de tres cuentas. Si se
crean con la cuenta personal de quien desarrolla, el día que esa persona ya no
esté la institución pierde el control. Conviene que las tres sean
institucionales desde el principio:

| Cuenta | Para qué | Si se pierde |
|---|---|---|
| **Google** | Hoja de inscripciones y su script | El formulario deja de recibir y los datos quedan en un Drive ajeno |
| **Netlify** | Publicación del sitio | No se puede actualizar ni cambiar el dominio |
| **GitHub** | Código fuente | Se pierde el historial (aunque quede copia local) |

Todas se pueden transferir después, pero es más fácil hacerlo bien de entrada.

---

## Otras opciones de hosting

- **Vercel** — mismo procedimiento que Netlify.
- **GitHub Pages** — subir el repositorio y activar Pages (ignora `netlify.toml`).
- **Hosting tradicional (cPanel / FTP)** — copiar todo dentro de `public_html`.

---

## Contenido incluido

Todo proviene de la presentación oficial de NORMUN (43 diapositivas):

| Sección | Contenido |
|---|---|
| 01 · El Modelo | Qué es un MUN, los tres pilares del proyecto |
| 02 · Comisiones | DISEC, ACNUR, ONU Mujeres, UNESCO, Consejo de Seguridad, Comisión Colombia |
| 03 · Roles | Presidencia, vicepresidencia, delegados, secretaría, staff |
| 04 · Procedimiento | Reglas de orden, lenguaje diplomático, tipos de debate, puntos, las 11 mociones, asamblea y votaciones, sanciones |
| 05 · Documentos | Discurso de entrada, papeles de trabajo, enmiendas, comunicado de prensa, banco de frases |
| 06 · Equipo | Coordinación del proyecto y de logística (con icono, sin fotos) |
| 07 · Inscripción | Los cuatro pasos y el aviso de «próximamente» |

---

## Pendientes de contenido

La página **no tiene ningún enlace roto ni ninguna imagen faltante**: todo lo
que no existe fue retirado en lugar de dejarlo apuntando a la nada. Se puede
publicar tal cual.

Lo único que queda por decidir o validar:

1. **Fechas y sede del modelo** — todavía no aparecen en la presentación.
   Cuando existan, van en el encabezado y en la sección de Inscripción.
2. **Imagen para compartir** (`og-normun.jpg`, 1200 × 630 px) — opcional. Por
   ahora se usa el logo, que funciona pero se ve pequeño en las vistas previas
   de WhatsApp.
3. **Funciones de cada rol** (sección 03) — en la presentación aparecían como
   imagen, así que se redactaron siguiendo la práctica estándar de un MUN.
   Están en `assets/js/main.js`, en el objeto `ROLES`, listas para que la mesa
   directiva las ajuste a su reglamento.
4. **Descripciones de los puntos de intervención** (pestaña «Puntos») — mismo
   caso: redacción estándar, pendiente de validación.

---

## Inscripciones en línea

El formulario de la sección 07 guarda cada inscripción en una hoja de cálculo
de Google, en tiempo real. Está construido pero **falta conectarlo**: son unos
diez minutos de configuración, explicados paso a paso en
[INSCRIPCIONES.md](INSCRIPCIONES.md).

El formulario está **siempre visible**: no hay ningún interruptor que alguien
tenga que acordarse de activar más adelante.

### Secciones retiradas

Estas se quitaron a pedido, por no estar listas todavía:

- **Video instructivo** — era la sección 07. Si vuelve, se reinserta antes de
  Inscripción y se renumeran ambas (`.sec-num`). El estilo `.section--video`
  se eliminó del CSS, así que habría que reescribirlo.
- **Contacto** (correo, Instagram) — estaba en el pie de página, en una tercera
  columna hoy renombrada como «NORMUN».
- **Fotos de las coordinadoras** — la sección 06 ahora usa un icono de persona
  en el color de cada tarjeta. Si algún día llegan las fotos, se reemplaza
  `.member__avatar` por un contenedor 3:4 con la imagen.

---

## Detalles técnicos

- **Globo terráqueo**: dibujado en `<canvas>`, sin librerías. Rota, marca
  Barranquilla y traza arcos hacia ciudades con sede de la ONU (Nueva York,
  Ginebra, Viena, La Haya, Nairobi, Addis Abeba…). Se pausa solo cuando sale
  de pantalla o la pestaña queda en segundo plano.
- **Rendimiento**: sin dependencias externas salvo las tipografías de Google
  Fonts. Todo el resto es CSS y SVG.
- **Responsive**: probado en escritorio, tablet y móvil.
- **Accesibilidad**: navegación por teclado en roles y pestañas, `aria-*` en los
  componentes interactivos, enlace de salto al contenido y foco visible.
- **Movimiento reducido**: si el sistema del visitante tiene activado
  «reducir movimiento», se desactivan animaciones y rotación del globo.
- **Impresión**: hoja de estilos de impresión incluida.
