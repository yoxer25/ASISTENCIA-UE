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
  constructor(institution, personal, recordDate, recordTime) {
    this.idInstitucion = institution;
    this.idPersonal = personal;
    this.fechaRegistro = recordDate;
    this.horaRegistro = recordTime;
  }

  /* para mostrar el registro de asistencia
  cuando el usuario que ingresa tiene rol
  de "administrador", este usuario podrá ver
  el registro de asistencia de todas las II.EE */
  static async getAttendanceRecordForAdmin() {
    const [attendanceRecord] = await pool.query(
      "SELECT p.nombrePersonal, r.idPersonal, r.fechaRegistro, r.horaRegistro FROM personal p INNER JOIN registro_asistencia r ON p.idPersonal = r.idPersonal"
    );
    if (attendanceRecord != "") {
      return attendanceRecord;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  /* para mostrar el registro de asistencia
  cuando el usuario que ingresa tiene rol
  de "directivo", este usuario podrá ver
  el registro de asistencia solo de su I.E */
  static async getAttendanceRecord(institution) {
    const [attendanceRecord] = await pool.query(
      "SELECT p.nombrePersonal, r.idPersonal, r.fechaRegistro, r.horaRegistro FROM personal p INNER JOIN registro_asistencia r ON p.idPersonal = r.idPersonal WHERE r.idInstitucion = ?",
      [institution]
    );
    if (attendanceRecord != "") {
      return attendanceRecord;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  /* para consultar los datos de un registro_asistencia
  pasándole el idPersonal, idInstitucion, fechaRegistro,
  horaRegistro */
  static async getAttendanceRecordForCreate(
    institution,
    personal,
    recordDate,
    recordTime
  ) {
    const [attendanceRecord] = await pool.query(
      "SELECT * FROM registro_asistencia r WHERE r.idInstitucion = ? and r.idPersonal = ? and r.fechaRegistro = ? and r.horaRegistro = ?",
      [institution, personal, recordDate, recordTime]
    );
    return attendanceRecord;
  }

  // para crear un nuevo registro de asistencia
  static async create(institution, personal, recordDate, recordTime) {
    const newRegister = new AttendanceRecord(
      institution,
      personal,
      recordDate,
      recordTime
    );
    newRegister.fechaCreado = await helpers.formatDateTime();
    console.log(newRegister);
    /* const resDB = await pool.query("INSERT INTO registro_asistencia SET ?", [
      newRegister,
    ]);
    return resDB; */
  }
}
