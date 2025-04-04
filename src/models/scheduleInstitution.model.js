/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";

/* exportamos nuestra clase "ScheduleInstitution"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "horario_institucion" de la base de datos */
export class ScheduleInstitution {
  // para consultar datos de todos los turnos del personal
  static async getScheduleInstitution() {
    const [scheduleInstitution] = await pool.query(
      "SELECT * FROM horario_institucion h WHERE h.estado != 0 ORDER BY h.idHorarioInstitucion"
    );
    if (scheduleInstitution != "") {
      return scheduleInstitution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un turno por nombre
  static async getByName(nameHorario) {
    const [scheduleInstitution] = await pool.query(
      "SELECT * FROM horario_institucion h WHERE h.nombreHorario = ? and h.estado != 0",
      [nameHorario]
    );
    if (scheduleInstitution != "") {
      return scheduleInstitution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un turno por id
  static async getById(idHorario) {
    const [scheduleInstitution] = await pool.query(
      "SELECT * FROM horario_institucion h WHERE h.idHorarioInstitucion = ? AND h.estado != 0",
      [idHorario]
    );
    if (scheduleInstitution != "") {
      return scheduleInstitution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  /* para consultar datos de todos los turnos que sean
  diferentes al turno que tiene registrado el trabajador */
  static async getSelectScheduleInstitution(Id) {
    const [scheduleInstitution] = await pool.query(
      "SELECT * FROM horario_institucion h WHERE NOT EXISTS (SELECT * FROM institucion i WHERE h.idHorarioInstitucion = i.idHorarioInstitucion AND h.estado != 0 AND i.idInstitucion = ? ORDER BY h.idHorarioInstitucion)",
      [Id]
    );
    if (scheduleInstitution) {
      return scheduleInstitution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}
