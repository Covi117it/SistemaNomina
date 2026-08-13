/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: sistema_nomina1q2q
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `Configuraciones`
--

DROP TABLE IF EXISTS `Configuraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Configuraciones` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SmtpServer` varchar(100) NOT NULL,
  `SmtpPort` int(11) NOT NULL,
  `SmtpSenderEmail` varchar(150) NOT NULL,
  `SmtpSenderName` varchar(150) NOT NULL,
  `SmtpUsername` varchar(150) NOT NULL,
  `SmtpPassword` varchar(250) NOT NULL,
  `SmtpEnableSsl` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Configuraciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Configuraciones` WRITE;
/*!40000 ALTER TABLE `Configuraciones` DISABLE KEYS */;
INSERT INTO `Configuraciones` VALUES
(1,'smtp.gmail.com',587,'danielemilmejia@gmail.com','Nómina Enfoco Institucional','danielemilmejia@gmail.com','bplb iuej hhmt pawu',1);
/*!40000 ALTER TABLE `Configuraciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Empleados`
--

DROP TABLE IF EXISTS `Empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Empleados` (
  `Codigo` varchar(20) NOT NULL,
  `Nombres` varchar(150) NOT NULL,
  `TipoDocumento` varchar(11) DEFAULT NULL,
  `Cedula` varchar(20) DEFAULT NULL,
  `EStatus` varchar(15) NOT NULL,
  `Puesto` varchar(100) DEFAULT NULL,
  `FechaIngreso` datetime(6) DEFAULT NULL,
  `FechaNacimiento` datetime(6) DEFAULT NULL,
  `Email` varchar(150) DEFAULT NULL,
  `FechaCreacion` datetime(6) NOT NULL,
  `FechaActualizacion` datetime(6) NOT NULL,
  PRIMARY KEY (`Codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Empleados`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Empleados` WRITE;
/*!40000 ALTER TABLE `Empleados` DISABLE KEYS */;
INSERT INTO `Empleados` VALUES
('001','Jorge Martínez','1','001-1193998-9','ACTIVO','Gerente General','2017-01-02 00:00:00.000000','2026-01-21 00:00:00.000000','Jmartinez@enfoco.com.do','2026-07-29 18:22:02.000000','2026-08-11 14:53:15.091949'),
('002','Yinet Jerez Noboa','1','001-0131654-5','ACTIVO','Directora Administrativa','2017-01-02 00:00:00.000000','2026-03-14 00:00:00.000000','yjerez@enfoco.com.do','2026-07-29 18:22:02.000000','2026-08-11 14:53:16.903453'),
('003','José Manuel De León','1','223-0103411-6','ACTIVO','Gerente Desarrollo de Software','2017-06-16 00:00:00.000000','2026-01-19 00:00:00.000000','jdeleon@enfoco.com.do','2026-07-29 18:22:02.000000','2026-08-11 14:53:18.467268'),
('004','Miguel Angel Carrión','1','001-1859583-4','ACTIVO','Ingeniero de Software Senior','2017-05-22 00:00:00.000000','2026-05-08 00:00:00.000000','Mcarrion@enfoco.com.do','2026-07-29 18:22:02.000000','2026-08-11 14:53:19.963495'),
('005','Delvin Martínez','1','229-0021149-5','ACTIVO','Ingeniero de Software','2018-06-11 00:00:00.000000','2026-06-20 00:00:00.000000','Dmartinez@enfoco.com.do','2026-07-29 18:22:02.000000','2026-08-11 14:53:21.691417'),
('006','Rosa Elba Martínez','1','229-0002689-3','ACTIVO','Analista de Proyectos','2019-04-30 00:00:00.000000','2026-10-27 00:00:00.000000','Rmartinez@enfoco.com.do','2026-07-29 18:22:02.000000','2026-08-11 14:53:23.611236'),
('007','Talia Villaman Guzman','1','061-0031753-3','ACTIVO','Ingeniero de Software Junior','2022-09-12 00:00:00.000000','2026-09-02 00:00:00.000000','Tvillaman@enfoco.com.do','2026-07-29 18:22:02.000000','2026-08-11 14:53:35.502454'),
('008','Isaias Emil Gomez','1','402-3035128-6','ACTIVO','Ingeniero de Software Junior','2024-10-01 00:00:00.000000','2026-12-27 00:00:00.000000','Igomez@enfoco.com.do','2026-07-29 18:22:02.000000','2026-07-30 20:07:09.124000'),
('009','Enmanuel Leandro Gomez','1','402-1237492-6','ACTIVO','Ingeniero de Software Junior','2024-10-01 00:00:00.000000','2026-04-05 00:00:00.000000','Egomez@enfoco.com.do','2026-07-29 18:22:02.000000','2026-07-30 20:07:09.124000'),
('010','Maria Rondon (Alexandra)','1','001-1354425-8','ACTIVO','Conserje','2024-09-02 00:00:00.000000','2026-03-06 00:00:00.000000','mariadelcarmenrondonvasquez@gmail.com','2026-07-29 18:22:02.000000','2026-07-30 20:07:09.124000'),
('011','José Manuel Peña Ventura','1','402-2934971-3','ACTIVO','Ingeniero de Software Junior','2026-04-06 00:00:00.000000','2026-09-04 00:00:00.000000','josemanuelpenav507@gmail.com','2026-07-29 18:22:02.000000','2026-07-30 20:07:09.124000'),
('012','Daniel Emil Mejia Valerio','1','402-0890983-4','ACTIVO','Ingeniero de Software Junior','2026-07-01 00:00:00.000000','2026-01-29 00:00:00.000000','danielemilmejia@gmail.com','2026-07-29 18:22:02.000000','2026-07-30 20:07:09.124000'),
('013','Denzel Martínez','1','402-0202904-6','ACTIVO','Ingeniero de Software Junior','2026-07-01 00:00:00.000000','2026-09-17 00:00:00.000000','dmcarrion17@gmail.com','2026-07-29 18:22:02.000000','2026-07-30 20:07:09.124000'),
('014','Heral Reyes Sanchez','1','402-1380047-3','ACTIVO','Ingeniero de Software Junior','2026-07-01 00:00:00.000000','2026-07-08 00:00:00.000000','heralsreyes@gmail.com','2026-07-29 18:22:02.000000','2026-08-11 14:53:39.458048');
/*!40000 ALTER TABLE `Empleados` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `EventosRecordatorios`
--

DROP TABLE IF EXISTS `EventosRecordatorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `EventosRecordatorios` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Titulo` varchar(200) NOT NULL,
  `Subtitulo` varchar(200) DEFAULT NULL,
  `Descripcion` text DEFAULT NULL,
  `FechaHora` datetime NOT NULL,
  `Prioridad` varchar(50) NOT NULL,
  `TipoEvento` varchar(50) NOT NULL,
  `AdjuntoNombre` varchar(250) DEFAULT NULL,
  `TextoAccion` varchar(100) DEFAULT NULL,
  `FechaCreacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EventosRecordatorios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `EventosRecordatorios` WRITE;
/*!40000 ALTER TABLE `EventosRecordatorios` DISABLE KEYS */;
/*!40000 ALTER TABLE `EventosRecordatorios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `NominaDetalles`
--

DROP TABLE IF EXISTS `NominaDetalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `NominaDetalles` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `NominaPeriodoId` int(11) NOT NULL,
  `CodigoEmpleado` varchar(20) NOT NULL,
  `NombreEmpleadoSnapshot` varchar(150) NOT NULL,
  `CedulaSnapshot` varchar(20) DEFAULT NULL,
  `EmailDestinatario` varchar(150) DEFAULT NULL,
  `SueldoPeriodo` decimal(18,2) NOT NULL,
  `Incentivo` decimal(18,2) NOT NULL,
  `Reembolso` decimal(18,2) NOT NULL,
  `HorasExtras` decimal(18,2) NOT NULL,
  `Prestamo` decimal(18,2) NOT NULL,
  `CuotaCumpleanos` decimal(18,2) NOT NULL,
  `TotalDevengado` decimal(18,2) NOT NULL,
  `SeguroVehiculo` decimal(18,2) NOT NULL,
  `SeguroMedico` decimal(18,2) NOT NULL,
  `Sfs` decimal(18,2) NOT NULL,
  `Afp` decimal(18,2) NOT NULL,
  `Isr` decimal(18,2) NOT NULL,
  `TotalDeducciones` decimal(18,2) NOT NULL,
  `NetoPagado` decimal(18,2) NOT NULL,
  `CorreoEnviado` tinyint(1) NOT NULL,
  `FechaEnvioCorreo` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_NominaDetalles_NominaPeriodoId` (`NominaPeriodoId`),
  CONSTRAINT `FK_NominaDetalles_NominaPeriodos_NominaPeriodoId` FOREIGN KEY (`NominaPeriodoId`) REFERENCES `NominaPeriodos` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NominaDetalles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `NominaDetalles` WRITE;
/*!40000 ALTER TABLE `NominaDetalles` DISABLE KEYS */;
/*!40000 ALTER TABLE `NominaDetalles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `NominaPeriodos`
--

DROP TABLE IF EXISTS `NominaPeriodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `NominaPeriodos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Mes` int(11) NOT NULL,
  `Quincena` varchar(5) NOT NULL,
  `Concepto` varchar(150) NOT NULL,
  `FechaProcesado` datetime(6) NOT NULL,
  `MontoTotalDevengado` decimal(18,2) NOT NULL,
  `MontoTotalDeducciones` decimal(18,2) NOT NULL,
  `MontoTotalNeto` decimal(18,2) NOT NULL,
  `Estado` varchar(20) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NominaPeriodos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `NominaPeriodos` WRITE;
/*!40000 ALTER TABLE `NominaPeriodos` DISABLE KEYS */;
/*!40000 ALTER TABLE `NominaPeriodos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `__EFMigrationsHistory`
--

DROP TABLE IF EXISTS `__EFMigrationsHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `__EFMigrationsHistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__EFMigrationsHistory`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `__EFMigrationsHistory` WRITE;
/*!40000 ALTER TABLE `__EFMigrationsHistory` DISABLE KEYS */;
INSERT INTO `__EFMigrationsHistory` VALUES
('20260807172820_InitialMariaDb','9.0.2');
/*!40000 ALTER TABLE `__EFMigrationsHistory` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-08-13  9:27:30
