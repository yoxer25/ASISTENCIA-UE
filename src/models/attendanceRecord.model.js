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
    )
    SELECT 
      f.fecha AS fechaRegistro,
      p.idPersonal,
      p.nombrePersonal,
      p.dniPersonal,
      p.idReloj,
      t.nombreTurno,

      r.idRegistroAsistencia,
      r.idInstitucion,
      r.fechaCreado,
      r.primeraEntrada,
      r.primeraSalida,
      r.segundaEntrada,
      r.segundaSalida,

      -- Datos de papeleta normal
      pap.idPapeleta,
      pap.numeroPapeleta,
      pap.fechaPapeleta,

      -- Datos de papeleta de vacación
      pv.idPapeletaVacacion,
      pv.numeroPV AS numeroPV,
      pv.desde AS desdeVacacion,
      pv.hasta AS hastaVacacion,

      -- Tipo de papeleta (prioridad: VACACION > PAPELETA)
      CASE 
        WHEN pv.idPapeletaVacacion IS NOT NULL THEN 'VACACION'
        WHEN pap.idPapeleta IS NOT NULL THEN 'PAPELETA'
        ELSE NULL
      END AS tipoPapeleta

    FROM fechas f
    CROSS JOIN personal p
    INNER JOIN turno_personal t ON p.idTurnoPersonal = t.idTurnoPersonal

    LEFT JOIN registro_asistencia r 
      ON r.idPersonal = p.idPersonal
      AND r.fechaRegistro = f.fecha
      AND r.idInstitucion = ?
      AND r.estado != 0

    LEFT JOIN papeleta pap 
      ON pap.solicitante = p.idPersonal 
      AND DATE(pap.fechaPapeleta) = f.fecha

    LEFT JOIN papeleta_vacacion pv 
      ON pv.solicitante = p.idPersonal 
      AND f.fecha BETWEEN pv.desde AND pv.hasta

    WHERE 
      p.idInstitucion = ?
      AND p.estado = 1

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
    )
    SELECT 
      f.fecha AS fechaRegistro,
      p.idPersonal,
      p.nombrePersonal,
      p.dniPersonal,
      p.idReloj,
      t.nombreTurno,
      r.idRegistroAsistencia,
      r.primeraEntrada,
      r.primeraSalida,
      r.segundaEntrada,
      r.segundaSalida,
      r.fechaCreado,

      pap.idPapeleta,
      pap.numeroPapeleta,
      pap.fechaPapeleta,

      pv.idPapeletaVacacion,
      pv.numeroPV AS numeroPV,
      pv.desde AS desdeVacacion,
      pv.hasta AS hastaVacacion,

      CASE 
        WHEN pap.desdeDia IS NOT NULL AND f.fecha BETWEEN pap.desdeDia AND pap.hastaDia THEN 'PAPELETA_FECHAS'
        WHEN pap.desdeHora IS NOT NULL 
             AND (
               (pap.desdeHora = '08:00:00' AND f.fecha = DATE_ADD(DATE(pap.fechaPapeleta), INTERVAL 1 DAY))
               OR
               (pap.desdeHora != '08:00:00' AND DATE(pap.fechaPapeleta) = f.fecha)
             )
          THEN 'PAPELETA_HORAS'
        WHEN pv.idPapeletaVacacion IS NOT NULL THEN 'VACACION'
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
          (pap.desdeHora = '08:00:00' AND f.fecha = DATE_ADD(DATE(pap.fechaPapeleta), INTERVAL 1 DAY))
          OR
          (pap.desdeHora != '08:00:00' AND DATE(pap.fechaPapeleta) = f.fecha)
        ))
      )
    LEFT JOIN papeleta_vacacion pv
      ON pv.solicitante = p.idPersonal
      AND f.fecha BETWEEN pv.desde AND pv.hasta
    WHERE 
      p.idInstitucion = ?
      AND p.estado = 1
      ${filterQuery}
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
