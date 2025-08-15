-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: dblocal_asistencia_ue
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anio_escolar`
--

DROP TABLE IF EXISTS `anio_escolar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anio_escolar` (
  `idAnio` int NOT NULL AUTO_INCREMENT,
  `nombreAnio` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`idAnio`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `area`
--

DROP TABLE IF EXISTS `area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `area` (
  `idArea` int NOT NULL AUTO_INCREMENT,
  `nombreArea` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `responsable` int DEFAULT NULL,
  `estado` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '1',
  `fechaCreado` datetime DEFAULT NULL,
  `fechaActualizado` datetime DEFAULT NULL,
  `fechaEliminado` datetime DEFAULT NULL,
  PRIMARY KEY (`idArea`),
  KEY `fx_idResponsable_idx` (`responsable`),
  CONSTRAINT `fx_idResponsable` FOREIGN KEY (`responsable`) REFERENCES `personal` (`idPersonal`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `asignatura`
--

DROP TABLE IF EXISTS `asignatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignatura` (
  `idAsignatura` int NOT NULL AUTO_INCREMENT,
  `nombreAsignatura` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int DEFAULT '1',
  PRIMARY KEY (`idAsignatura`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `carpeta_docente`
--

DROP TABLE IF EXISTS `carpeta_docente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carpeta_docente` (
  `idCarpetaDocente` int NOT NULL AUTO_INCREMENT,
  `idInstitucion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `idAnio` int NOT NULL,
  `idPersonal` int NOT NULL,
  `estado` int DEFAULT '1',
  `fechaCreado` datetime DEFAULT NULL,
  PRIMARY KEY (`idCarpetaDocente`),
  KEY `fx_idIIEE_idx` (`idInstitucion`),
  KEY `fx_idAnio_idx` (`idAnio`),
  KEY `fx_idDocente_idx` (`idPersonal`),
  CONSTRAINT `fx_idAnio` FOREIGN KEY (`idAnio`) REFERENCES `anio_escolar` (`idAnio`),
  CONSTRAINT `fx_idDocente` FOREIGN KEY (`idPersonal`) REFERENCES `personal` (`idPersonal`),
  CONSTRAINT `fx_idIIEE` FOREIGN KEY (`idInstitucion`) REFERENCES `institucion` (`idInstitucion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `correlativo_papeleta`
--

DROP TABLE IF EXISTS `correlativo_papeleta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `correlativo_papeleta` (
  `idCorrelativo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ultimaPapeleta` int NOT NULL,
  PRIMARY KEY (`idCorrelativo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `distrito`
--

DROP TABLE IF EXISTS `distrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `distrito` (
  `idDistrito` int NOT NULL AUTO_INCREMENT,
  `nombreDistrito` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`idDistrito`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documento_institucion`
--

DROP TABLE IF EXISTS `documento_institucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documento_institucion` (
  `idDocumento` int NOT NULL AUTO_INCREMENT,
  `idInstitucion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `idAnio` int NOT NULL,
  `nombreOriginal` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombreDocumento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fechaCreado` datetime DEFAULT NULL,
  PRIMARY KEY (`idDocumento`),
  KEY `fx_idDocumentoIE_idx` (`idInstitucion`),
  KEY `fx_anio_ie_idx` (`idAnio`),
  CONSTRAINT `fx_anio_ie` FOREIGN KEY (`idAnio`) REFERENCES `anio_escolar` (`idAnio`),
  CONSTRAINT `fx_idDocumentoIE` FOREIGN KEY (`idInstitucion`) REFERENCES `institucion` (`idInstitucion`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documento_profesor`
--

DROP TABLE IF EXISTS `documento_profesor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documento_profesor` (
  `idDocumento` int NOT NULL AUTO_INCREMENT,
  `idSubcarpeta` int NOT NULL,
  `nombreOriginal` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombreDocumento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fechaCreado` datetime DEFAULT NULL,
  PRIMARY KEY (`idDocumento`),
  KEY `fx_idSubcarpeta_idx` (`idSubcarpeta`),
  CONSTRAINT `fx_idSubcarpeta` FOREIGN KEY (`idSubcarpeta`) REFERENCES `subcarpeta_profesor` (`idSubcarpeta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `especialista`
--

DROP TABLE IF EXISTS `especialista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialista` (
  `idEspecialista` int NOT NULL AUTO_INCREMENT,
  `idPersonal` int NOT NULL,
  `especialidad` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1',
  `fechaCreado` datetime DEFAULT NULL,
  `fechaActualizado` datetime DEFAULT NULL,
  `fechaEliminado` datetime DEFAULT NULL,
  PRIMARY KEY (`idEspecialista`),
  KEY `fx_idPersonal_especialista_idx` (`idPersonal`),
  CONSTRAINT `fx_idPersonal_especialista` FOREIGN KEY (`idPersonal`) REFERENCES `personal` (`idPersonal`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `horario_institucion`
--

DROP TABLE IF EXISTS `horario_institucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horario_institucion` (
  `idHorarioInstitucion` int NOT NULL AUTO_INCREMENT,
  `nombreHorario` varchar(45) NOT NULL,
  `estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`idHorarioInstitucion`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `institucion`
--

DROP TABLE IF EXISTS `institucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institucion` (
  `idInstitucion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `idDistrito` int NOT NULL,
  `idNivel` int NOT NULL,
  `idTurnoInstitucion` int DEFAULT '1',
  `idHorarioInstitucion` int DEFAULT '1',
  `nombreInstitucion` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombreDirector` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int DEFAULT '1',
  `fechaCreado` datetime DEFAULT NULL,
  `fechaActualizado` datetime DEFAULT NULL,
  `fechaEliminado` datetime DEFAULT NULL,
  PRIMARY KEY (`idInstitucion`),
  KEY `fx_idDistrito_idx` (`idDistrito`),
  KEY `fx_idNivel_idx` (`idNivel`),
  KEY `fx_idTurnoInstitucion_idx` (`idTurnoInstitucion`),
  KEY `fx_idHorarioInstitucion_idx` (`idHorarioInstitucion`),
  CONSTRAINT `fx_idDistrito` FOREIGN KEY (`idDistrito`) REFERENCES `distrito` (`idDistrito`),
  CONSTRAINT `fx_idHorarioInstitucion` FOREIGN KEY (`idHorarioInstitucion`) REFERENCES `horario_institucion` (`idHorarioInstitucion`),
  CONSTRAINT `fx_idNivel` FOREIGN KEY (`idNivel`) REFERENCES `nivel_educativo` (`idNivelEducativo`),
  CONSTRAINT `fx_idTurnoInstitucion` FOREIGN KEY (`idTurnoInstitucion`) REFERENCES `turno_institucion` (`idTurnoInstitucion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nivel_educativo`
--

DROP TABLE IF EXISTS `nivel_educativo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nivel_educativo` (
  `idNivelEducativo` int NOT NULL AUTO_INCREMENT,
  `nombreNivel` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`idNivelEducativo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `papeleta`
--

DROP TABLE IF EXISTS `papeleta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `papeleta` (
  `idPapeleta` int NOT NULL AUTO_INCREMENT,
  `numeroPapeleta` varchar(6) COLLATE utf8mb4_general_ci NOT NULL,
  `fechaPapeleta` datetime NOT NULL,
  `solicitante` int NOT NULL,
  `dependencia` int NOT NULL,
  `condicionLaboral` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `desdeDia` date DEFAULT NULL,
  `hastaDia` date DEFAULT NULL,
  `desdeHora` time DEFAULT NULL,
  `hastaHora` time DEFAULT NULL,
  `motivo` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `fundamento` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `VBjefe` tinyint(1) DEFAULT '0',
  `aprobadorJefe` int DEFAULT NULL,
  `VBrrhh` tinyint(1) DEFAULT '0',
  `aprobadorRRHH` int DEFAULT NULL,
  `VBadministracion` tinyint(1) DEFAULT '0',
  `aprobadorADM` int DEFAULT NULL,
  PRIMARY KEY (`idPapeleta`),
  KEY `fx_idAreaPapeleta_idx` (`dependencia`),
  KEY `fx_solicitante_idx` (`solicitante`),
  KEY `fx_idAprobadorJefe_idx` (`aprobadorJefe`),
  KEY `fx_idAprobadorRRHH_idx` (`aprobadorRRHH`),
  KEY `fx_idAprobadorADM_idx` (`aprobadorADM`),
  CONSTRAINT `fx_aprobadorADM` FOREIGN KEY (`aprobadorADM`) REFERENCES `personal` (`idPersonal`),
  CONSTRAINT `fx_aprobadorJefe` FOREIGN KEY (`aprobadorJefe`) REFERENCES `personal` (`idPersonal`),
  CONSTRAINT `fx_aprobadorRRHH` FOREIGN KEY (`aprobadorRRHH`) REFERENCES `personal` (`idPersonal`),
  CONSTRAINT `fx_idAreaPapeleta` FOREIGN KEY (`dependencia`) REFERENCES `area` (`idArea`),
  CONSTRAINT `fx_solicitante` FOREIGN KEY (`solicitante`) REFERENCES `personal` (`idPersonal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `papeleta_vacacion`
--

DROP TABLE IF EXISTS `papeleta_vacacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `papeleta_vacacion` (
  `idPapeletaVacacion` int NOT NULL AUTO_INCREMENT,
  `numeroPV` varchar(6) COLLATE utf8mb4_general_ci NOT NULL,
  `fechaPV` datetime NOT NULL,
  `solicitante` int NOT NULL,
  `dependencia` int NOT NULL,
  `cargo` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `institucion` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `referencia` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `periodo` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `desde` date NOT NULL,
  `hasta` date NOT NULL,
  `observacion` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `VBjefe` tinyint(1) DEFAULT '0',
  `aprobadorJefe` int DEFAULT NULL,
  PRIMARY KEY (`idPapeletaVacacion`),
  KEY `idAreaPV_idx` (`dependencia`),
  KEY `fx_idSolicitante_idx` (`solicitante`),
  KEY `fx_idAprobadorJefe_idx` (`aprobadorJefe`),
  CONSTRAINT `fx_idAprobadorJefe` FOREIGN KEY (`aprobadorJefe`) REFERENCES `personal` (`idPersonal`),
  CONSTRAINT `fx_idAreaPV` FOREIGN KEY (`dependencia`) REFERENCES `area` (`idArea`),
  CONSTRAINT `fx_idSolicitante` FOREIGN KEY (`solicitante`) REFERENCES `personal` (`idPersonal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personal`
--

DROP TABLE IF EXISTS `personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal` (
  `idPersonal` int NOT NULL AUTO_INCREMENT,
  `idInstitucion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `idTurnoPersonal` int DEFAULT '1',
  `idAreaPersonal` int DEFAULT '1',
  `asignatura` int NOT NULL DEFAULT '1',
  `dniPersonal` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombrePersonal` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `idReloj` int DEFAULT NULL,
  `docente` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NO',
  `estado` int DEFAULT '1',
  `fechaCreado` datetime DEFAULT NULL,
  `fechaActualizado` datetime DEFAULT NULL,
  `fechaEliminado` datetime DEFAULT NULL,
  PRIMARY KEY (`idPersonal`),
  KEY `fx_idInstitucion_idx` (`idInstitucion`),
  KEY `fx_idTurnoPersonal_idx` (`idTurnoPersonal`),
  KEY `fx_idArea_idx` (`idAreaPersonal`),
  KEY `fx_idAsignatura_idx` (`asignatura`),
  CONSTRAINT `fx_idArea` FOREIGN KEY (`idAreaPersonal`) REFERENCES `area` (`idArea`),
  CONSTRAINT `fx_idAsignatura` FOREIGN KEY (`asignatura`) REFERENCES `asignatura` (`idAsignatura`),
  CONSTRAINT `fx_idInstitucion_personal` FOREIGN KEY (`idInstitucion`) REFERENCES `institucion` (`idInstitucion`),
  CONSTRAINT `fx_idTurnoPersonal` FOREIGN KEY (`idTurnoPersonal`) REFERENCES `turno_personal` (`idTurnoPersonal`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registro_asistencia`
--

DROP TABLE IF EXISTS `registro_asistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_asistencia` (
  `idRegistroAsistencia` int NOT NULL AUTO_INCREMENT,
  `idInstitucion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `idPersonal` int NOT NULL,
  `fechaRegistro` date DEFAULT NULL,
  `primeraEntrada` time DEFAULT NULL,
  `primeraSalida` time DEFAULT NULL,
  `segundaEntrada` time DEFAULT NULL,
  `segundaSalida` time DEFAULT NULL,
  `estado` int DEFAULT '1',
  `fechaCreado` datetime DEFAULT NULL,
  `fechaActualizado` datetime DEFAULT NULL,
  `fechaEliminado` datetime DEFAULT NULL,
  PRIMARY KEY (`idRegistroAsistencia`),
  KEY `fx_idInstitucion_asistencia_idx` (`idInstitucion`),
  KEY `fx_idPersonal_idx` (`idPersonal`),
  CONSTRAINT `fx_idInstitucion_asistencia` FOREIGN KEY (`idInstitucion`) REFERENCES `institucion` (`idInstitucion`),
  CONSTRAINT `fx_idPersonal` FOREIGN KEY (`idPersonal`) REFERENCES `personal` (`idPersonal`)
) ENGINE=InnoDB AUTO_INCREMENT=975 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rol_usuario`
--

DROP TABLE IF EXISTS `rol_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_usuario` (
  `idRolUsuario` int NOT NULL AUTO_INCREMENT,
  `nombreRol` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`idRolUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subcarpeta_profesor`
--

DROP TABLE IF EXISTS `subcarpeta_profesor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcarpeta_profesor` (
  `idSubcarpeta` int NOT NULL AUTO_INCREMENT,
  `idCarpeta` int NOT NULL,
  `nombreSubcarpeta` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int NOT NULL DEFAULT '1',
  `fechaCreado` datetime DEFAULT NULL,
  PRIMARY KEY (`idSubcarpeta`),
  KEY `fx_idCarpetaDocente_idx` (`idCarpeta`),
  CONSTRAINT `fx_idCarpetaDocente` FOREIGN KEY (`idCarpeta`) REFERENCES `carpeta_docente` (`idCarpetaDocente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `turno_institucion`
--

DROP TABLE IF EXISTS `turno_institucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turno_institucion` (
  `idTurnoInstitucion` int NOT NULL AUTO_INCREMENT,
  `nombreTurno` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int DEFAULT '1',
  PRIMARY KEY (`idTurnoInstitucion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `turno_personal`
--

DROP TABLE IF EXISTS `turno_personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turno_personal` (
  `idTurnoPersonal` int NOT NULL AUTO_INCREMENT,
  `nombreTurno` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int DEFAULT '1',
  PRIMARY KEY (`idTurnoPersonal`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `idInstitucion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `idRol` int NOT NULL,
  `dni_usuario` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contrasena` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int DEFAULT '1',
  `fechaCreado` datetime DEFAULT NULL,
  `fechaActualizado` datetime DEFAULT NULL,
  `fechaEliminado` datetime DEFAULT NULL,
  `fechaCambioContrasena` datetime DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  KEY `fx_idInstitucion_idx` (`idInstitucion`),
  KEY `fx_idRol_idx` (`idRol`),
  CONSTRAINT `fx_idInstitucion` FOREIGN KEY (`idInstitucion`) REFERENCES `institucion` (`idInstitucion`),
  CONSTRAINT `fx_idRol` FOREIGN KEY (`idRol`) REFERENCES `rol_usuario` (`idRolUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-15 12:42:55
