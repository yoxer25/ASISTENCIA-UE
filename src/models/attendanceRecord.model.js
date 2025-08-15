/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "AttendanceRecord"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "registro_asistencia" de la base de datos */
export class AttendanceRecord {
  constructor(
    institution,
    personal,
    registrationDate,
    firstHourEntry,
    firstHourDeparture,
    secondHourEntry,
    secondDepartureTime
  ) {
    this.idInstitucion = institution;
    this.idPersonal = personal;
    this.fechaRegistro = registrationDate;
    this.primeraEntrada = firstHourEntry;
    this.primeraSalida = firstHourDeparture;
    this.segundaEntrada = secondHourEntry;
    this.segundaSalida = secondDepartureTime;
  }

  // para mostrar la data según corresponda al momento de visitar la página de reportes
  static async getData(institution) {
    const [attendanceRecord] = await pool.query(
      `
    WITH RECURSIVE fechas AS (
      SELECT CURDATE() - INTERVAL 4 DAY AS fecha
      UNION ALL
      SELECT DATE_ADD(fecha, INTERVAL 1 DAY)
      FROM fechas
      WHERE fecha < CURDATE()
    ),
    vacaciones_agrupadas AS (
      SELECT 
        pv.solicitante AS idPersonal,
        pv.idPapeletaVacacion,
        pv.numeroPV,
        pv.desde,
        pv.hasta,
        d.fecha
      FROM papeleta_vacacion pv
      JOIN fechas d 
        ON d.fecha BETWEEN pv.desde AND pv.hasta
    )
    SELECT 
      f.fecha AS fechaRegistro,
      p.idPersonal,
      p.nombrePersonal,
      p.dniPersonal,
      p.idReloj,
      t.nombreTurno,

      r.idRegistroAsistencia,
      r.fechaCreado,
      r.primeraEntrada,
      r.primeraSalida,
      r.segundaEntrada,
      r.segundaSalida,

      GROUP_CONCAT(DISTINCT pap.idPapeleta) AS idsPapeletas,
      GROUP_CONCAT(DISTINCT pap.numeroPapeleta) AS numerosPapeletas,

      -- Anular datos de vacaciones si hay marcas o papeletas normales
      CASE 
        WHEN r.idRegistroAsistencia IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 THEN v.idPapeletaVacacion
        ELSE NULL
      END AS idPapeletaVacacion,

      CASE 
        WHEN r.idRegistroAsistencia IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 THEN v.numeroPV
        ELSE NULL
      END AS numeroPV,

      CASE 
        WHEN r.idRegistroAsistencia IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 THEN v.desde
        ELSE NULL
      END AS desdeVacacion,

      CASE 
        WHEN r.idRegistroAsistencia IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 THEN v.hasta
        ELSE NULL
      END AS hastaVacacion,

      -- Tipo de papeleta final
      CASE 
        WHEN COUNT(DISTINCT pap.idPapeleta) > 0 THEN 'PAPELETA'
        WHEN r.idRegistroAsistencia IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 AND v.idPapeletaVacacion IS NOT NULL THEN 'VACACION'
        ELSE NULL
      END AS tipoPapeleta

    FROM (
      SELECT * FROM fechas WHERE DAYOFWEEK(fecha) BETWEEN 2 AND 6
    ) AS f
    CROSS JOIN personal p
    INNER JOIN turno_personal t ON p.idTurnoPersonal = t.idTurnoPersonal

    LEFT JOIN registro_asistencia r 
      ON r.idPersonal = p.idPersonal
      AND r.fechaRegistro = f.fecha
      AND r.idInstitucion = ?
      AND r.estado != 0

    LEFT JOIN papeleta pap 
      ON pap.solicitante = p.idPersonal 
      AND (
        (pap.desdeDia IS NOT NULL AND f.fecha BETWEEN pap.desdeDia AND pap.hastaDia)
        OR
        (pap.desdeHora IS NOT NULL AND (
          (pap.desdeHora = '08:00:00' AND f.fecha = 
            CASE 
              WHEN WEEKDAY(pap.fechaPapeleta) = 4 THEN DATE_ADD(pap.fechaPapeleta, INTERVAL 3 DAY)
              WHEN WEEKDAY(pap.fechaPapeleta) = 5 THEN DATE_ADD(pap.fechaPapeleta, INTERVAL 2 DAY)
              WHEN WEEKDAY(pap.fechaPapeleta) = 6 THEN DATE_ADD(pap.fechaPapeleta, INTERVAL 1 DAY)
              ELSE DATE_ADD(pap.fechaPapeleta, INTERVAL 1 DAY)
            END
          )
          OR (pap.desdeHora != '08:00:00' AND DATE(pap.fechaPapeleta) = f.fecha)
        ))
      )

    LEFT JOIN vacaciones_agrupadas v 
      ON v.idPersonal = p.idPersonal AND v.fecha = f.fecha

    WHERE 
      p.idInstitucion = ?
      AND p.estado = 1

    GROUP BY 
      f.fecha,
      p.idPersonal,
      p.nombrePersonal,
      p.dniPersonal,
      p.idReloj,
      t.nombreTurno,
      r.idRegistroAsistencia,
      r.fechaCreado,
      r.primeraEntrada,
      r.primeraSalida,
      r.segundaEntrada,
      r.segundaSalida,
      v.idPapeletaVacacion,
      v.numeroPV,
      v.desde,
      v.hasta

    ORDER BY p.idReloj, f.fecha
    `,
      [institution, institution]
    );

    if (attendanceRecord.length > 0) {
      return attendanceRecord;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  /* para mostrar el registro de asistencia;
  si el usuario que ingresa tiene rol
  de "directivo", podrá ver el registro de
  asistencia solo de su I.E; si el usuario que
  ingresa tiene rol de "administrador", podrá ver
  el registro de asistencia de todas las II.EE */
  static async getAttendanceRecord(
    institution,
    startDate,
    endDate,
    username,
    dni
  ) {
    let filterQuery = "";
    let filterParams = [];

    if (username) {
      filterQuery = "AND p.nombrePersonal LIKE ?";
      filterParams.push(`%${username}%`);
    } else if (dni) {
      filterQuery = "AND p.dniPersonal = ?";
      filterParams.push(dni);
    }

    const [attendanceRecord] = await pool.query(
      `
    WITH RECURSIVE fechas AS (
      SELECT DATE(?) AS fecha
      UNION ALL
      SELECT DATE_ADD(fecha, INTERVAL 1 DAY)
      FROM fechas
      WHERE fecha < DATE(?)
    ),
    vacaciones_agrupadas AS (
      SELECT 
        pv.solicitante AS idPersonal,
        pv.idPapeletaVacacion,
        pv.numeroPV,
        pv.desde,
        pv.hasta,
        d.fecha
      FROM papeleta_vacacion pv
      JOIN fechas d 
        ON d.fecha BETWEEN pv.desde AND pv.hasta
    )
    SELECT 
      f.fecha AS fechaRegistro,
      p.idPersonal,
      p.nombrePersonal,
      p.dniPersonal,
      p.idReloj,
      t.nombreTurno,

      MAX(r.idRegistroAsistencia) AS idRegistroAsistencia,
      MAX(r.primeraEntrada) AS primeraEntrada,
      MAX(r.primeraSalida) AS primeraSalida,
      MAX(r.segundaEntrada) AS segundaEntrada,
      MAX(r.segundaSalida) AS segundaSalida,
      MAX(r.fechaCreado) AS fechaCreado,

      GROUP_CONCAT(DISTINCT pap.idPapeleta) AS idsPapeletas,
      GROUP_CONCAT(DISTINCT pap.numeroPapeleta) AS numerosPapeletas,
      GROUP_CONCAT(DISTINCT DATE(pap.fechaPapeleta)) AS fechasPapeletas,

      -- Vacaciones (anuladas si hay marcas o papeleta)
      CASE 
        WHEN MAX(r.idRegistroAsistencia) IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 THEN MAX(v.idPapeletaVacacion)
        ELSE NULL
      END AS idPapeletaVacacion,

      CASE 
        WHEN MAX(r.idRegistroAsistencia) IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 THEN MAX(v.numeroPV)
        ELSE NULL
      END AS numeroPV,

      CASE 
        WHEN MAX(r.idRegistroAsistencia) IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 THEN MAX(v.desde)
        ELSE NULL
      END AS desdeVacacion,

      CASE 
        WHEN MAX(r.idRegistroAsistencia) IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 THEN MAX(v.hasta)
        ELSE NULL
      END AS hastaVacacion,

      -- Tipo de papeleta
      CASE 
        WHEN COUNT(DISTINCT pap.idPapeleta) > 0 THEN 'PAPELETA'
        WHEN MAX(r.idRegistroAsistencia) IS NULL AND COUNT(DISTINCT pap.idPapeleta) = 0 AND MAX(v.idPapeletaVacacion) IS NOT NULL THEN 'VACACION'
        ELSE NULL
      END AS tipoPapeleta

    FROM (
      SELECT * FROM fechas WHERE DAYOFWEEK(fecha) BETWEEN 2 AND 6
    ) AS f
    CROSS JOIN personal p
    LEFT JOIN turno_personal t ON p.idTurnoPersonal = t.idTurnoPersonal

    LEFT JOIN registro_asistencia r 
      ON r.idPersonal = p.idPersonal 
      AND r.fechaRegistro = f.fecha
      AND r.idInstitucion = ?
      AND r.estado != 0

    LEFT JOIN papeleta pap 
      ON pap.solicitante = p.idPersonal 
      AND (
        (pap.desdeDia IS NOT NULL AND f.fecha BETWEEN pap.desdeDia AND pap.hastaDia)
        OR 
        (pap.desdeHora IS NOT NULL AND (
          (pap.desdeHora = '08:00:00' AND f.fecha = 
            CASE 
              WHEN WEEKDAY(pap.fechaPapeleta) = 4 THEN DATE_ADD(pap.fechaPapeleta, INTERVAL 3 DAY)
              WHEN WEEKDAY(pap.fechaPapeleta) = 5 THEN DATE_ADD(pap.fechaPapeleta, INTERVAL 2 DAY)
              WHEN WEEKDAY(pap.fechaPapeleta) = 6 THEN DATE_ADD(pap.fechaPapeleta, INTERVAL 1 DAY)
              ELSE DATE_ADD(pap.fechaPapeleta, INTERVAL 1 DAY)
            END
          )
          OR (pap.desdeHora != '08:00:00' AND DATE(pap.fechaPapeleta) = f.fecha)
        ))
      )

    LEFT JOIN vacaciones_agrupadas v
      ON v.idPersonal = p.idPersonal AND v.fecha = f.fecha

    WHERE 
      p.idInstitucion = ?
      AND p.estado = 1
      ${filterQuery}

    GROUP BY 
      f.fecha,
      p.idPersonal,
      p.nombrePersonal,
      p.dniPersonal,
      p.idReloj,
      t.nombreTurno

    ORDER BY p.idReloj, f.fecha
    `,
      [startDate, endDate, institution, institution, ...filterParams]
    );

    if (attendanceRecord.length > 0) {
      return attendanceRecord;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  /* para consultar los datos de un registro_asistencia
  pasándole el idPersonal, idInstitucion, fechaRegistro,
  primeraEntrada */
  static async getAttendanceRecordForCreate(
    institution,
    personal,
    registrationDate
  ) {
    const [attendanceRecord] = await pool.query(
      "SELECT * FROM registro_asistencia r WHERE (r.idInstitucion = ? and r.idPersonal = ?) and (r.fechaRegistro = ?)",
      [institution, personal, registrationDate]
    );
    return attendanceRecord;
  }

  // para crear un nuevo registro de asistencia
  static async create(
    institution,
    personal,
    registrationDate,
    firstHourEntry,
    firstHourDeparture,
    secondHourEntry,
    secondDepartureTime
  ) {
    const newRegister = new AttendanceRecord(
      institution,
      personal,
      registrationDate,
      firstHourEntry,
      firstHourDeparture,
      secondHourEntry,
      secondDepartureTime
    );
    newRegister.fechaCreado = await helpers.formatDateTime();
    await pool.query("INSERT INTO registro_asistencia SET ?", [newRegister]);
  }

  // para elimiunar un registro de asistencia
  static async deleteById(Id, institution, personal) {
    const newRegister = {
      idInstitucion: institution,
      idPersonal: personal,
    };
    newRegister.estado = 0;
    newRegister.fechaEliminado = await helpers.formatDateTime();
    const [res] = await pool.query(
      "UPDATE registro_asistencia r SET ? WHERE r.idRegistroAsistencia = ?",
      [newRegister, Id]
    );
    return res;
  }
}
