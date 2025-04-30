/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "Ballot"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "papeleta" de la base de datos */
export class Ballot {
  constructor(
    correlative,
    applicant,
    dependency,
    workingCondition,
    reason,
    foundation,
    startDate,
    endDate,
    startTime,
    endTime
  ) {
    this.numeroPapeleta = correlative;
    this.solicitante = applicant;
    this.dependencia = dependency;
    this.condicionLaboral = workingCondition;
    this.desdeDia = startDate;
    this.hastaDia = endDate;
    this.desdeHora = startTime;
    this.hastaHora = endTime;
    this.motivo = reason;
    this.fundamento = foundation;
  }

  // para consultar todas las áreas registradas en la base de datos
  static async getBallots() {
    const [ballots] = await pool.query(
      "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea"
    );
    return ballots;
  }

  // para consultar datos de una área por id
  static async getAreaById(id) {
    const [ballots] = await pool.query(
      "SELECT * FROM area a INNER JOIN personal p ON p.idPersonal = a.responsable WHERE a.idArea = ? AND a.estado != 0",
      [id]
    );
    return ballots;
  }

  // para crear nueva área
  static async create(
    correlative,
    applicant,
    dependency,
    workingCondition,
    reason,
    foundation,
    startDate,
    endDate,
    startTime,
    endTime
  ) {
    const newBallot = new Ballot(
      correlative,
      applicant,
      dependency,
      workingCondition,
      reason,
      foundation,
      startDate,
      endDate,
      startTime,
      endTime
    );
    newBallot.fechaPapeleta = helpers.formatDateTime();
    const [res] = await pool.query("INSERT INTO papeleta SET ?", [newBallot]);
    return res;
  }

  // para actualizar una área
  static async set(id, name, designatedPerson, _method) {
    if (_method === "PUT") {
      const newBallot = new Area(name, designatedPerson);
      newBallot.fechaActualizado = helpers.formatDateTime();
      const [res] = await pool.query("UPDATE area a SET ? WHERE a.idArea = ?", [
        newBallot,
        id,
      ]);
      return res;
    }
    if (_method === "PATCH") {
      const newBallot = {
        estado: 0,
        fechaEliminado: helpers.formatDateTime(),
      };
      const [res] = await pool.query("UPDATE area a SET ? WHERE a.idArea = ?", [
        newBallot,
        id,
      ]);
      return res;
    }
  }

  /* para consultar datos de todas las áreas que sean
  diferentes a la área que tiene registrado el trabajador */
  static async getSelectArea(id) {
    const [categories] = await pool.query(
      "SELECT * FROM area a WHERE NOT EXISTS (SELECT * FROM personal p WHERE a.idArea = p.idArea AND a.estado != 0 AND p.idPersonal = ?)",
      [id]
    );
    if (categories) {
      return categories;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}
