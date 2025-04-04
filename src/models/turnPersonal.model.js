/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";

/* exportamos nuestra clase "TurnPersonal"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "turno_personal" de la base de datos */
export class TurnPersonal {
  // para consultar datos de todos los turnos del personal
  static async getTurnPersonal() {
    const [turnPersonal] = await pool.query(
      "SELECT * FROM turno_personal t WHERE t.estado != 0 ORDER BY t.idTurnoPersonal"
    );
    if (turnPersonal != "") {
      return turnPersonal;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un turno por nombre
  static async getByName(nameTurno) {
    const [turnPersonal] = await pool.query(
      "SELECT * FROM turno_personal t WHERE t.nombreTurno = ? and t.estado != 0",
      [nameTurno]
    );
    if (turnPersonal != "") {
      return turnPersonal;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un turno por id
  static async getById(idTurno) {
    const [turnPersonal] = await pool.query(
      "SELECT * FROM turno_personal t WHERE t.idTurnoPersonal = ? AND t.estado != 0",
      [idTurno]
    );
    if (turnPersonal != "") {
      return turnPersonal;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  /* para consultar datos de todos los turnos que sean
  diferentes al turno que tiene registrado el trabajador */
  static async getSelectTurnPersonal(Id) {
    const [turnPersonal] = await pool.query(
      "SELECT * FROM turno_personal t WHERE NOT EXISTS (SELECT * FROM personal p WHERE t.idTurnoPersonal = p.idTurnoPersonal AND t.estado != 0 AND p.idPersonal = ? ORDER BY t.idTurnoPersonal)",
      [Id]
    );
    if (turnPersonal) {
      return turnPersonal;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}
