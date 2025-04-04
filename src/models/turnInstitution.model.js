/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";

/* exportamos nuestra clase "TurnInstitution"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "turno_institucion" de la base de datos */
export class TurnInstitution {
  // para consultar datos de todos los turnos
  static async getTurnInstitution() {
    const [turnInstitution] = await pool.query(
      "SELECT * FROM turno_institucion t WHERE t.estado != 0"
    );
    if (turnInstitution != "") {
      return turnInstitution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un turno por nombre
  static async getByName(nameTurno) {
    const [turnInstitution] = await pool.query(
      "SELECT * FROM turno_institucion t WHERE t.nombreTurno = ? and t.estado != 0",
      [nameTurno]
    );
    if (turnInstitution != "") {
      return turnInstitution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un turno por id
  static async getById(idTurno) {
    const [turnInstitution] = await pool.query(
      "SELECT * FROM turno_institucion t WHERE t.idTurnoInstitucion = ? AND t.estado != 0",
      [idTurno]
    );
    if (turnInstitution != "") {
      return turnInstitution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  /* para consultar datos de todos los turnos que sean
  diferentes al turno que tiene registrado la IE */
  static async getSelectTurnInstitution(Id) {
    const [turnInstitution] = await pool.query(
      "SELECT * FROM turno_institucion t WHERE NOT EXISTS (SELECT * FROM institucion i WHERE t.idTurnoInstitucion = i.idTurnoInstitucion AND t.estado != 0 AND i.idInstitucion = ?)",
      [Id]
    );
    if (turnInstitution) {
      return turnInstitution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}
