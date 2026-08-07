# 🏢 Sistema de Nómina y Procesamiento Quincenal (ENFOCO)

Aplicación de escritorio multiplataforma (**Windows**, **macOS** y **Linux / CachyOS**) desarrollada con **Tauri v2**, **React 19** y **.NET 10**. Diseñada para la gestión maestra de empleados, procesamiento quincenal de pagos por Excel, generación automática de volantes de pago en PDF, histórico de recibos y distribución masiva por correo electrónico (SMTP).

---

## 🛠️ Pila Tecnológica

- **Frontend**: Tauri v2 + React 19 + TypeScript + Tailwind CSS + SweetAlert2 + Lucide Icons + pnpm
- **Backend**: .NET 10 Minimal API + Entity Framework Core 9
- **Base de Datos**: SQLite (Local `nomina.db`) con soporte para EF Core Migrations
- **Librerías Clave**:
  - `ExcelDataReader`: Lectura y parsing de archivos Excel (`.xlsx` / `.xls`).
  - `QuestPDF`: Generación de comprobantes oficiales de pago en formato PDF de alta fidelidad.
  - `MailKit`: Conexión SMTP y distribución masiva de correos electrónicos con adjuntos.
  - `Swashbuckle`: Documentación interactiva de la API mediante Swagger UI (`/swagger`).

---

## 📋 Estado del Proyecto (100% Funcional)

### 🧱 Fase 1: Capa de Datos y Modelos (.NET 10 Backend)
- [x] **Modelos C#**: `Empleado.cs`, `NominaPeriodo.cs`, `NominaDetalle.cs`, `ConfiguracionSistema.cs`.
- [x] **Base de Datos**: `AppDbContext.cs` registrado con SQLite (`nomina.db`).
- [x] **Migraciones EF Core**: Estructura de base de datos migrada y lista para producción.

### 👥 Fase 2: Módulo 1 - Maestro de Empleados (CRUD & Excel)
- [x] **Endpoints REST**: `/api/empleados` (CRUD completo, Upsert masivo, filtro estatus).
- [x] **Interfaz React**: Tabla interactiva con búsqueda en tiempo real, modales de creación/edición, autoguardado de estatus y alertas con SweetAlert2.

### 💰 Fase 3: Módulo 2 - Procesamiento Quincenal de Pagos
- [x] **Cruce Automático**: Endpoint `/api/nomina/preview-quincena` para procesar el Excel quincenal y realizar el matcheo por `CODIGO EMPLEADO` vs base de datos.
- [x] **Cierre de Nómina**: Endpoint `/api/nomina/procesar-quincena` para guardar la cabecera e historial detallado inalterable en SQLite.
- [x] **Staging Table**: Tabla interactiva para ajustar devengados/deducciones antes de confirmar el pago.

### 📄 Fase 4: Módulo 3 - Volantes en PDF y Distribución por Correo (SMTP)
- [x] **Generación de PDF**: `PdfService.cs` con QuestPDF para generar volantes de pago de calidad institucional.
- [x] **Visor de PDF**: Modal interactivo (`PDFPaystubModal.tsx`) para inspeccionar el recibo de pago de cualquier empleado.
- [x] **Servicio SMTP & Modal**: Configuración dinámica de servidor SMTP (`smtp.gmail.com:587`), remite, usuario y contraseña de aplicación (`SmtpConfigModal.tsx`).
- [x] **Envío Masivo por Email**: Endpoint `/api/nomina/enviar-volantes-correo` utilizando MailKit.

### 📜 Fase 5: Módulo 4 - Histórico de Nóminas & Búsqueda Avanzada
- [x] **Consulta Histórica**: Endpoint `/api/nomina/historico` para consultar cierres anteriores.
- [x] **Filtros Dinámicos**: Filtrado por Año, Mes, Quincena (`1Q`/`2Q`) y término de búsqueda por código o nombre a través de todos los períodos.

---

## ⚡ Guía de Ejecución Local

### 1. Iniciar el Backend (.NET 10)
```bash
cd backend
dotnet run
