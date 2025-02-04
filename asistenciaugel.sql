-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-02-2025 a las 17:11:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `asistenciaugel`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `idasistencia` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `entrada` varchar(100) NOT NULL,
  `salida` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuariosue`
--

CREATE TABLE `usuariosue` (
  `idusuario` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `dni` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuariosue`
--

INSERT INTO `usuariosue` (`idusuario`, `nombres`, `dni`) VALUES
(1, 'MIGUEL ARAMBULU GARCIA', 0),
(2, 'RENEE SANDOVAL OLAYA', 0),
(3, 'LUCIA MAZA OROZCO ', 0),
(4, 'YURMI SANTOS OCUPA', 0),
(5, 'DINORA GONZA PINTADO', 0),
(6, 'ELMER NAIRA', 0),
(7, 'JHON FACUNDO', 0),
(8, 'FRANCISCO GUTIERREZ GARCIA', 0),
(9, 'WALTER CASTILLO', 0),
(10, 'WISON NEIRA ZURITA', 0),
(11, 'GUIDO CORDOBA MEZONES', 0),
(12, 'WILSON NEIRA MELENDREZ', 0),
(13, 'NATHALY RIVERA ADRIANO', 0),
(14, 'MIRIAN NEIRA ALBERCA', 0),
(15, 'DARSY', 0),
(16, 'ROSALINA OZETA     \"POR CONTRASEÑA\" ID 16', 0),
(17, 'MARIBEL JIMEZ CORDOBA', 0),
(18, 'MARIANELA CARRASCO CASTILLO', 0),
(19, 'MILAGROS DIAZ ', 0),
(20, 'YANET FACUNDO TORRES', 0),
(21, 'PEDRO HUAYAMA', 0),
(22, 'MARICELA CHUMACERO BARCO', 0),
(23, 'HENRY MICHEL PALACIOS', 0),
(24, 'HENRY DOMINGUEZ', 0),
(25, 'MIXY ADRIANZEN GOMEZ', 0),
(26, 'KARIN ', 0),
(27, 'VIVIANA TABOADA ROJAS', 0),
(28, 'CLAUDIA LABAN RIVERA', 0),
(29, 'ABRAHAN EZPINOZA', 0),
(30, 'PAOLA POZO RAMIREZ', 0),
(31, 'HENRY OMAR GUZMAN MOSCOL', 0),
(32, 'MARIA OJEDA', 0),
(33, 'YORMAN', 0),
(34, 'ELIZABETH PUELLES', 0),
(35, 'SOLEY FEBRE', 0),
(36, 'JUAN RICARTE RAMIREZ SANTOS', 0),
(37, 'TOMAS BOBADILLA', 0),
(38, 'HELBER DORVOBA MARCELO', 0),
(39, 'GABRIEL SAAVEDRA COBA', 0),
(40, 'MILAGROZ ZETA ', 0),
(41, 'MARI MANCHAY PALACIOS', 0),
(42, 'YANET CUTIN ', 0),
(43, 'EULER UBILLUS', 0),
(44, 'ROSARIO MARTINEZ', 0),
(45, 'CESAR ELERA', 0),
(46, 'SEGUNDO GUEVARA CHINGUEL', 0),
(47, 'CRISTHIAN CHOQUEHUANCA', 0),
(48, 'CARMEN PEÑA', 0),
(49, 'MARIADELA ', 0),
(50, 'CESAR GUTIERRES', 0),
(51, 'ANGEL SALVADOR ', 0),
(52, 'MARIELA VENCES CORONADO', 0),
(53, 'CARMEN GIRON', 0),
(54, 'MILAGROS OCAÑA', 0),
(55, 'ELIZA CHINGUEL', 0),
(56, 'HUMBERTO CRUZ', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`idasistencia`),
  ADD KEY `idusuario` (`idusuario`);

--
-- Indices de la tabla `usuariosue`
--
ALTER TABLE `usuariosue`
  ADD PRIMARY KEY (`idusuario`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`idusuario`) REFERENCES `usuariosue` (`idusuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
