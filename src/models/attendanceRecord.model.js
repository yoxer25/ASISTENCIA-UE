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

  /* para mostrar el registro de asistencia;
  si el usuario que ingresa tiene rol
  de "directivo", podrá ver el registro de
  asistencia solo de su I.E; si el usuario que
  ingresa tiene rol de "administrador", podrá ver
  el registro de asistencia de todas las II.EE */
  static async getAttendanceRecord(institution, startDate, endDate, username, dni) {
    if (username === undefined && dni !== undefined) {
      const [attendanceRecord] = await pool.query(
        "SELECT p.nombrePersonal, p.dniPersonal, r.fechaRegistro, r.primeraEntrada, r.primeraSalida, r.segundaEntrada, r.segundaSalida FROM personal p INNER JOIN registro_asistencia r ON p.idPersonal = r.idPersonal WHERE (r.idInstitucion = ? AND r.estado != 0) AND (r.fechaRegistro BETWEEN ? AND ?) AND p.dnipersonal = ? ORDER BY r.idRegistroAsistencia",
        [institution, startDate, endDate, dni]
      );
      if (attendanceRecord != "") {
        return attendanceRecord;
      } else {
        throw new Error("Datos no encontrados");
      }
    }
    if (username !== undefined && dni === undefined) {
      const [attendanceRecord] = await pool.query(
        `SELECT p.nombrePersonal, p.dniPersonal, r.fechaRegistro, r.primeraEntrada, r.primeraSalida, r.segundaEntrada, r.segundaSalida FROM personal p INNER JOIN registro_asistencia r ON p.idPersonal = r.idPersonal WHERE (r.idInstitucion = ? AND r.estado != 0) AND (r.fechaRegistro BETWEEN ? AND ?) AND p.nombrePersonal LIKE '%${username}%' ORDER BY r.idRegistroAsistencia`,
        [institution, startDate, endDate]
      );
      if (attendanceRecord != "") {
        return attendanceRecord;
      } else {
        throw new Error("Datos no encontrados");
      }
    }
    if (username === undefined && dni === undefined) {
      const [attendanceRecord] = await pool.query(
        "SELECT p.nombrePersonal, p.dniPersonal, r.fechaRegistro, r.primeraEntrada, r.primeraSalida, r.segundaEntrada, r.segundaSalida FROM personal p INNER JOIN registro_asistencia r ON p.idPersonal = r.idPersonal WHERE (r.idInstitucion = ? AND r.estado != 0) AND (r.fechaRegistro BETWEEN ? AND ?) ORDER BY r.idRegistroAsistencia",
        [institution, startDate, endDate]
      );
      if (attendanceRecord != "") {
        return attendanceRecord;
      } else {
        throw new Error("Datos no encontrados");
      }
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
}
