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

  /* para consultar las papeletas registradas en la base de datos (según usuario) */
  static async getBallots(applicant, dependency) {
    let ballots = [];
    // cuando el usuario es jefe de RRHH o administración
    if (!applicant && !dependency) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante ORDER BY p.numeroPapeleta DESC"
      );
    }

    // cuando el usuario no es jefe de área
    if (applicant && !dependency) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? ORDER BY p.numeroPapeleta DESC",
        [applicant]
      );
    }

    // cuando el usuario es jefe de área excepto de RRHH o administración
    if (!applicant && dependency) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? ORDER BY p.numeroPapeleta DESC",
        [dependency]
      );
    }

    return ballots;
  }

  /* para consultar las papeletas registradas en la base de datos
  por usuario o fecha de ausencia (según usuario) */
  static async getBallotsSearch(applicant, area, username, dependency, date) {
    let ballots = [];
    // cuando el usuario es jefe de RRHH o administración
    if (!applicant && !area) {
      if (username && date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? AND DATE(p.fechaPapeleta) = ? ORDER BY p.numeroPapeleta DESC",
          [username, date]
        );
      }
      if (username && !date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? ORDER BY p.numeroPapeleta DESC",
          [username]
        );
      }
      if (dependency && date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? AND DATE(p.fechaPapeleta) = ? ORDER BY p.numeroPapeleta DESC",
          [dependency, date]
        );
      }
      if (dependency && !date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? ORDER BY p.numeroPapeleta DESC",
          [dependency]
        );
      }
      if (!username && !dependency) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE DATE(p.fechaPapeleta) = ? ORDER BY p.numeroPapeleta DESC",
          [date]
        );
      }
    }

    // cuando el usuario no es jefe de área
    if (applicant && date) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? AND DATE(p.fechaPapeleta) = ? ORDER BY p.numeroPapeleta DESC",
        [applicant, date]
      );
    }
    if (applicant && !date) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? ORDER BY p.numeroPapeleta DESC",
        [applicant]
      );
    }

    // cuando el usuario es jefe de área excepto de RRHH o administración
    if (area) {
      if (username && date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE (p.solicitante = ? AND p.dependencia = ?) AND DATE(p.fechaPapeleta) = ? ORDER BY p.numeroPapeleta DESC",
          [username, area, date]
        );
      }
      if (username && !date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? AND p.dependencia = ? ORDER BY p.numeroPapeleta DESC",
          [username, area]
        );
      }
      if (!username && date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? AND DATE(p.fechaPapeleta) = ? ORDER BY p.numeroPapeleta DESC",
          [area, date]
        );
      }
      if (!username && !date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? ORDER BY p.numeroPapeleta DESC",
          [area]
        );
      }
    }

    return ballots;
  }

  // para consultar datos de una papeleta por id
  static async getBallotById(id) {
    const [ballots] = await pool.query(
      "SELECT pa.numeroPapeleta, pa.fechaPapeleta, pa.condicionLaboral, pa.desdeDia, pa.hastaDia, pa.desdeHora, pa.hastaHora, pa.motivo, pa.fundamento, pa.VBjefe, pa.VBrrhh, pa.VBadministracion, p.nombrePersonal, p.dniPersonal, p.idAreaPersonal, a.nombreArea FROM papeleta pa INNER JOIN personal p ON p.idPersonal = pa.solicitante INNER JOIN area a ON pa.dependencia = a.idArea WHERE pa.idPapeleta = ?",
      [id]
    );
    return ballots;
  }

  // para registrar una nueva papeleta
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

  // para aprobar una papeleta
  static async update(id, dependency, areaPersonal) {
    if (dependency === 3 || dependency === 4 || dependency === 5) {
      return await pool.query(
        "UPDATE papeleta p SET p.VBjefe = 1 WHERE p.idPapeleta = ?",
        [id]
      );
    }
    if (dependency === 2) {
      if (areaPersonal === 2) {
        return await pool.query(
          "UPDATE papeleta p SET p.VBjefe = 1, p.VBadministracion = 1 WHERE p.idPapeleta = ?",
          [id]
        );
      } else {
        return await pool.query(
          "UPDATE papeleta p SET p.VBadministracion = 1 WHERE p.idPapeleta = ?",
          [id]
        );
      }
    }
    if (dependency === 6) {
      if (areaPersonal === 6) {
        return await pool.query(
          "UPDATE papeleta p SET p.VBjefe = 1, p.VBrrhh = 1 WHERE p.idPapeleta = ?",
          [id]
        );
      } else {
        return await pool.query(
          "UPDATE papeleta p SET p.VBrrhh = 1 WHERE p.idPapeleta = ?",
          [id]
        );
      }
    }
  }
}
