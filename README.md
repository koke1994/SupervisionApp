# SupervisionApp GCC — Zihuatanejo

App móvil para captura digital del formato de Supervisión y Acompañamiento.
Basada en `supervision_zihua_FIXED.html` como documento de referencia.

---

## Flujo de pantallas

```
Home (Historial bóveda)
  └─ Nueva Sesión
        ├─ Paso 1: Datos Generales   (tipo, fecha, gestor, líder, GIC…)
        ├─ Paso 2: Formulario        (+ Cliente | + Solicitud | + Herramientas)
        │           ├─ Clientes      GPS blindado + Foto blindada + Checklists
        │           ├─ Solicitudes   9 pasos + recomendaciones
        │           └─ Herramientas  5 categorías Sí/No
        ├─ Paso 3: Coaching y Firmas (3 textareas + 3 canvas de firma táctil)
        └─ Paso 4: Resumen
                    ├─ 💾 Guardar en Bóveda (SQLite local — funciona offline)
                    ├─ 📧 Email automático (Google Apps Script — sin acción del usuario)
                    ├─ 📄 Generar PDF descargable
                    └─ ☁ Subir historial a Google Drive (para NotebookLM)
```

---

## Instalación

```bash
cd SupervisionApp
npm install
npx expo start
```

---

## Configurar Google Apps Script (Email automático)

1. Ve a https://script.google.com → Nuevo proyecto
2. Pega este código:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const asunto = data.asunto || "Reporte de Supervisión GCC";
  const cuerpo = data.cuerpo || "Se adjunta el reporte de supervisión.";

  const blob = Utilities.newBlob(
    Utilities.base64Decode(data.pdf),
    'application/pdf',
    data.filename
  );

  GmailApp.sendEmail(
    data.destinatario || 'correo_respaldo@empresa.com',
    asunto,
    cuerpo,
    { attachments: [blob], name: 'Sistema Supervisión GCC' }
  );

  return ContentService.createTextOutput('ok');
}
```

3. Implementar → Implementación nueva → Aplicación web
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
4. Copia la URL y pégala en `src/constants/config.js` → `GAS_URL`

---

## Configurar Google Drive (NotebookLM)

1. Google Cloud Console → APIs → Google Drive API → Habilitar
2. Credenciales → OAuth 2.0 → Aplicación Android + Web
3. Pegar `ANDROID_CLIENT_ID` y `WEB_CLIENT_ID` en `src/constants/config.js`
4. En la app: Configuración → Conectar Google Drive
5. En NotebookLM: + Fuente → Google Drive → selecciona carpeta "Supervisión GCC — NotebookLM"

---

## Características fiel al HTML original

| Característica       | HTML                    | App                          |
|----------------------|-------------------------|------------------------------|
| Bóveda offline       | localStorage            | SQLite (persiste entre sesiones) |
| GPS blindado         | navigator.geolocation   | expo-location                |
| Foto blindada        | input[capture=camera]   | expo-image-picker            |
| Firmas táctiles      | Canvas + PanResponder   | PanResponder                 |
| Email automático     | Google Apps Script      | Google Apps Script (mismo)   |
| Folio único          | ZIH-AAAAMMDD-XXXXXX     | Mismo formato                |
| Secciones dinámicas  | addCliente/Solicitud/Herr.| FABs flotantes             |
| Indicador de guardado| save-indicator          | Banner en pantalla Home      |
