# CV electrónico interactivo - Schubert Stalin Lombeida Manjarrez

Sitio web estático bilingüe, preparado para GitHub Pages, Vercel, Netlify o un enlace embebido desde Google Sites. El idioma se selecciona automáticamente según el navegador y también puede cambiarse manualmente con los botones ES/EN.

La versión actual está configurada como hoja de vida general, no orientada a una postulación específica. El repositorio documental público se alimenta con enlaces de Google Drive y mantiene los documentos personales sensibles bajo solicitud por correo.

## Estructura

- `index.html`: estructura principal del sitio.
- `styles.css`: diseño responsive, estilo ejecutivo y modo impresión.
- `app.js`: navegación, cambio de idioma, filtros, buscador, dashboard y renderizado de datos.
- `data.js`: contenido maestro editable del CV.
- `evidence-data.js`: inventario documental generado desde el CSV con enlaces de Google Drive.
- `assets/img`: fotografía profesional.
- `assets/docs`: CV ejecutivo general en Word u otros documentos públicos autorizados.
- `.nojekyll`: archivo requerido para que GitHub Pages publique todos los archivos estáticos sin procesamiento adicional.

## Editar datos del CV

Abra `data.js` para actualizar:

- `person`: correo, teléfono autorizado, LinkedIn, CV ejecutivo, fotografía y repositorio documental.
- `experience`: cargos, periodos, funciones, etiquetas y respaldos.
- `education`: títulos registrados, formación en curso y antecedentes documentados.
- `certifications`: cursos, talleres, seminarios y certificaciones.
- `projects`: áreas de impacto profesional.
- `indicators`: valores del dashboard sobre 100 puntos.

El sitio evita mostrar enlaces provisionales al público. La sección de evidencias debe usar enlaces reales de Google Drive para títulos, certificados laborales, cursos y reconocimientos.

## Actualizar enlaces de Google Drive

1. Suba o actualice los documentos en Google Drive.
2. Genere nuevamente el CSV de enlaces desde Google Apps Script.
3. Cruce el CSV con el inventario definitivo.
4. Genere de nuevo `evidence-data.js` desde el archivo `evidencias_drive_cv_data.json`.
5. Revise en el navegador que títulos, certificados laborales, cursos y reconocimientos abran correctamente.

Validación de la versión actual:

- Evidencias públicas conectadas a Google Drive: 133.
- Certificaciones/cursos con respaldo directo: 110.
- Experiencias con respaldo directo: 9.
- Formación académica con respaldo directo: 3.
- Documentos personales sensibles: visibles solo como solicitud por correo.

Los documentos personales se muestran en una sección separada porque contienen información sensible. El sitio no publica botones para verlos ni descargarlos; cada tarjeta permite solicitarlos por correo electrónico al titular.

## Actualizar fotografía

Coloque la imagen autorizada en `assets/img/` y actualice en `data.js`:

```js
photo: "assets/img/schubert-lombeida.png"
```

## Publicar en GitHub Pages

1. Cree un repositorio, por ejemplo `cv-electronico-schubert`.
2. Suba el contenido de esta carpeta.
3. En GitHub, vaya a `Settings > Pages`.
4. Seleccione la rama principal y la carpeta raíz.
5. Guarde y espere la URL pública.

Si publica solo esta carpeta, el archivo `index.html` debe quedar en la raíz del repositorio. Si publica dentro de un repositorio más grande, configure Pages para servir desde la carpeta `cv-electronico-schubert` o mueva el contenido de esta carpeta a la raíz del repositorio.

## Publicar en Vercel

1. Cree un nuevo proyecto en Vercel.
2. Conecte el repositorio.
3. No configure framework.
4. Use la carpeta raíz como salida estática.
5. Publique.

## Publicar en Netlify

1. Cree un nuevo sitio desde Git.
2. No use comando de build.
3. Defina la carpeta de publicación como la raíz del proyecto.
4. Publique.

## Usar en Google Sites

Google Sites no funciona como hosting directo para un sitio estático completo con JavaScript. La ruta recomendada es publicar en GitHub Pages, Vercel o Netlify y luego insertar el enlace o embeber la página desde Google Sites.

## Actualizar el PDF ejecutivo

1. Abra el sitio en el navegador.
2. Use el botón `Imprimir / PDF`.
3. Seleccione `Guardar como PDF`.
4. Revise que las secciones principales queden limpias y sin enlaces provisionales.
5. Suba el PDF final a Google Drive o a `assets/docs/`.
6. Actualice en `data.js`:

```js
pdf: "assets/docs/Hoja_Vida_Ejecutiva_General_Schubert_Lombeida_ES.docx",
pdfEn: "assets/docs/General_Executive_CV_Schubert_Lombeida_EN.docx"
```

## Nota metodológica del dashboard

Los indicadores son internos, referenciales y editables; no constituyen certificaciones externas. La metodología sugerida es:

- 40% experiencia comprobable.
- 25% nivel de responsabilidad.
- 20% formación o capacitación relacionada.
- 15% evidencia documental disponible.
