# 🏢 Sistema de Nómina y Procesamiento Quincenal

Aplicación de escritorio multiplataforma (**Windows**, **macOS** y **Linux / CachyOS**) diseñada para la gestión maestra de empleados, procesamiento de pagos quincenales por Excel, generación de volantes de pago en PDF, gestión editable de correos de destinatarios y exportación de archivos para transferencias bancarias.

---

## 🛠️ Pila Tecnológica

- **Frontend**: Tauri v2 + React + TypeScript + Tailwind CSS v4 + SweetAlert2 + pnpm
- **Backend**: .NET 10 Web API + Entity Framework Core 9
- **Base de Datos**: SQLite (Local) con soporte para MariaDB (Servidor)
- **Librerías Clave**:
  - `ExcelDataReader`: Procesamiento ultra rápido de archivos Excel (`.xlsx` / `.xls`).
  - `QuestPDF`: Generación de comprobantes de pago en PDF de alta calidad.
  - `MailKit`: Envío masivo de correos electrónicos por empleado.
  - `Swashbuckle`: Documentación interactiva de la API con Swagger UI.

---

## 📋 Estado del Proyecto y Hoja de Ruta de Integración

### 🧱 Fase 1: Capa de Datos y Modelos (.NET 10 Backend)
> *Objetivo: Definir las tablas de la base de datos local SQLite y los modelos C#.*

- [x] **Tarea 1.1**: Crear la estructura de carpetas (`backend/Models/` y `backend/Data/`).
- [x] **Tarea 1.2**: Crear la entidad `Empleado.cs` (Maestro de empleados).
- [x] **Tarea 1.3**: Crear la entidad `NominaPeriodo.cs` (Cabecera histórica quincenal).
- [x] **Tarea 1.4**: Crear la entidad `NominaDetalle.cs` (Recibo de pago individual inalterable).
- [x] **Tarea 1.5**: Crear `AppDbContext.cs` y registrar SQLite en `appsettings.json` y `Program.cs`.
- [x] **Tarea 1.6**: Generar y ejecutar las migraciones de la base de datos (`nomina.db` verificada).

---

### 👥 Fase 2: Módulo 1 - Maestro de Empleados (Gestión Directa & CRUD)
> *Objetivo: Registro manual, edición completa en modal con doble clic, autoguardado de estatus y alertas con SweetAlert2.*

- [x] **Tarea 2.1**: Implementar `ExcelService.cs` en C# para procesamiento de archivos de hoja de cálculo.
- [x] **Tarea 2.2**: Crear los Endpoints de la API en .NET 10 (`EmpleadosEndpoints.cs`):
  - `GET /api/empleados`: Listar empleados ordenados por código.
  - `POST /api/empleados`: Insertar un empleado manualmente.
  - `PUT /api/empleados/{codigo}`: Editar campos de un empleado (nombres, puesto, cédula, fechas, email y estatus).
  - `DELETE /api/empleados/{codigo}`: Eliminar un empleado individual por su código.
  - `POST /api/empleados/guardar-lote`: Sincronización masiva (Upsert).
  - `POST /api/empleados/toggle-estatus-todos`: Activar/Desactivar masivo.
  - `DELETE /api/empleados/vaciar-bd`: Borrado completo con confirmación de seguridad.
- [x] **Tarea 2.3**: Registrar servicio y endpoints en `Program.cs` y verificar en Swagger UI.
- [x] **Tarea 2.4**: Crear la interfaz en React (`EmployeesPage.tsx` + `NewEmployeeModal.tsx`):
  - Creación manual con modal emergente y máscara de fecha inteligente (`DD/MM/YYYY`).
  - Edición mediante doble clic en la fila de la tabla del directorio oficial.
  - Selector desplegable `ACTIVO`/`INACTIVO` con autoguardado directo en SQLite.
  - Diálogos de confirmación estilizados con SweetAlert2.
  - Botón superior listo para el procesamiento de la nómina quincenal.

---

### 💰 Fase 3: Módulo 2 - Procesamiento Quincenal de Pagos (Excel 2)
> *Objetivo: Subir el Excel de pagos quincenales, hacer el cruce automático por `CODIGO` y previsualizar subtotales.*

- [ ] **Tarea 3.1**: Extender `ExcelService.cs` para leer el Excel quincenal (Devengados: Incentivo, Reembolso, Horas Extras, Préstamo, Cumpleaños; Deducciones: Seguro Vehículo, Seguro Médico, SFS, AFP, ISR; Neto a Pagar).
- [ ] **Tarea 3.2**: Lógica de **Cruce Automático** por `CODIGO EMPLEADO` vs `CODIGO` del Maestro.
- [ ] **Tarea 3.3**: Endpoints de la API en .NET 10 (`NominaEndpoints.cs`):
  - `POST /api/nomina/preview-quincena`: Procesa el Excel de pagos y devuelve la vista previa cruzada.
  - `POST /api/nomina/procesar-quincena`: Guarda el lote histórico quincenal en la BD.
- [ ] **Tarea 3.4**: Interfaz Frontend en React (`PayrollImportPage.tsx` / `StagingTable.tsx`):
  - Carga quincenal y tabla de validación de montos con alertas de códigos no encontrados.

---

### 📄 Fase 4: Módulo 3 - Volantes en PDF y Gestión de Correos
> *Objetivo: Renderizar el volante de pago idéntico a la plantilla institucional en PDF y permitir la pre-edición de correos.*

- [ ] **Tarea 4.1**: Implementar `PdfService.cs` con `QuestPDF` en C# (diseño empresarial: Encabezado *ENFOCO NOMINA*, Devengados vs Deducciones, Neto en caja destacada, firma y pie de página).
- [ ] **Tarea 4.2**: Implementar `EmailService.cs` con `MailKit` en C# para distribución masiva por correo.
- [ ] **Tarea 4.3**: Endpoints de la API en .NET 10:
  - `GET /api/nomina/volante-pdf/{periodoId}/{codigoEmpleado}`: Renderizado de PDF en tiempo real.
  - `POST /api/nomina/enviar-volantes-correo`: Ejecución de envío masivo por email.
- [ ] **Tarea 4.4**: Interfaz Frontend en React (`PaystubsPage.tsx` + `PDFPaystubModal.tsx`):
  - Visor interactivo de comprobantes PDF.
  - Panel lateral de pre-edición de lista de correos (ver, editar, agregar o eliminar correos antes de enviar).

---

### 🏦 Fase 5: Módulo 4 - Transferencias Bancarias y Cierre de Nómina
> *Objetivo: Pantalla de parámetros bancarios, exportación de archivo TXT/CSV y opciones flexibles de correo.*

- [ ] **Tarea 5.1**: Implementar `BankFileService.cs` en C# para generación de archivos planos de carga bancaria (`.txt` / `.csv`).
- [ ] **Tarea 5.2**: Endpoints de la API en .NET 10:
  - `POST /api/nomina/generar-transferencia`: Retorna el archivo bancario y resumen consolidado.
- [ ] **Tarea 5.3**: Interfaz Frontend en React (`TransfersPage.tsx` + `TransferModal.tsx`):
  - Formulario de cuenta origen, banco destino y fecha de efectividad.
  - Checkbox de envío automático al transferir + botón independiente de envío manual posterior.

---

## ⚡ Comandos para Ejecutar el Proyecto

### 1. Iniciar el Backend (.NET 10)
```bash
cd /home/daniele/Proyectos/SistemaNomina/backend
dotnet run
