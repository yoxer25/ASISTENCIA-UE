/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "VacationTicket"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "papeleta_vacacion" de la base de datos */
export class VacationTicket {
  constructor(
    correlative,
    applicant,
    dependency,
    charge,
    workCenter,
    reference,
    period,
    observation,
    startDate,
    endDate
  ) {
    this.numeroPV = correlative;
    this.solicitante = applicant;
    this.dependencia = dependency;
    this.cargo = charge;
    this.institucion = workCenter;
    this.referencia = reference;
    this.periodo = period;
    this.observacion = observation;
    this.desde = startDate;
    this.hasta = endDate;
  }

  /* para consultar las papeletas registradas en la base de datos (según usuario) */
  static async getTickets(applicant, dependency) {
    let ballots = [];
    // cuando el usuario es jefe de RRHH
    if (!applicant && !dependency) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante ORDER BY p.numeroPV DESC"
      );
    }

    // cuando el usuario no es jefe de área
    if (applicant && !dependency) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? ORDER BY p.numeroPV DESC",
        [applicant]
      );
    }

    // cuando el usuario es jefe de área excepto de RRHH
    if (!applicant && dependency) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? ORDER BY p.numeroPV DESC",
        [dependency]
      );
    }

    return ballots;
  }

  /* para consultar las papeletas registradas en la base de datos
  por usuario o fecha de ausencia (según usuario) */
  static async getTicketsSearch(applicant, area, username, dependency, date) {
    console.log(applicant, area, username, dependency, date);
    let ballots = [];
    // cuando el usuario es jefe de RRHH o administración
    if (!applicant && !area) {
      if (username && date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? AND DATE(p.fechaPV) = ? ORDER BY p.numeroPV DESC",
          [username, date]
        );
      }
      if (username && !date) {
        console.log("solo user");
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? ORDER BY p.numeroPV DESC",
          [username]
        );
      }

      if (dependency && date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? AND DATE(p.fechaPV) = ? ORDER BY p.numeroPV DESC",
          [dependency, date]
        );
      }
      if (dependency && !date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? ORDER BY p.numeroPV DESC",
          [dependency]
        );
      }
      if (!username && !dependency) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE DATE(p.fechaPV) = ? ORDER BY p.numeroPV DESC",
          [date]
        );
      }
    }

    // cuando el usuario no es jefe de área
    if (applicant && date) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? AND DATE(p.fechaPV) = ? ORDER BY p.numeroPV DESC",
        [applicant, date]
      );
    }
    if (applicant && !date) {
      [ballots] = await pool.query(
        "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? ORDER BY p.numeroPV DESC",
        [applicant]
      );
    }

    // cuando el usuario es jefe de área excepto de RRHH o administración
    if (area) {
      if (username && date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE (p.solicitante = ? AND p.dependencia = ?) AND DATE(p.fechaPV) = ? ORDER BY p.numeroPV DESC",
          [username, area, date]
        );
      }
      if (username && !date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.solicitante = ? AND p.dependencia = ? ORDER BY p.numeroPV DESC",
          [username, area]
        );
      }
      if (!username && date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? AND DATE(p.fechaPV) = ? ORDER BY p.numeroPV DESC",
          [area, date]
        );
      }
      if (!username && !date) {
        [ballots] = await pool.query(
          "SELECT * FROM papeleta_vacacion p INNER JOIN area a ON p.dependencia = a.idArea INNER JOIN personal pe ON pe.idPersonal = p.solicitante WHERE p.dependencia = ? ORDER BY p.numeroPV DESC",
          [area]
        );
      }
    }

    return ballots;
  }

  // para consultar datos de una papeleta por id
  static async getTicketById(id) {
    const [ticket] = await pool.query(
      "SELECT pa.numeroPV, pa.fechaPV, pa.cargo, pa.desde, pa.hasta, pa.institucion, pa.referencia, pa.periodo, pa.observacion, pa.VBjefe, p.nombrePersonal, p.dniPersonal, p.idAreaPersonal, a.nombreArea FROM papeleta_vacacion pa INNER JOIN personal p ON p.idPersonal = pa.solicitante INNER JOIN area a ON pa.dependencia = a.idArea WHERE pa.idPapeletaVacacion = ?",
      [id]
    );
    return ticket;
  }

  // para registrar una nueva papeleta de vacaciones
  static async create(
    correlative,
    applicant,
    dependency,
    charge,
    workCenter,
    reference,
    period,
    observation,
    startDate,
    endDate
  ) {
    const newTicket = new VacationTicket(
      correlative,
      applicant,
      dependency,
      charge,
      workCenter,
      reference,
      period,
      observation,
      startDate,
      endDate
    );
    newTicket.fechaPV = helpers.formatDateTime();
    const [res] = await pool.query("INSERT INTO papeleta_vacacion SET ?", [
      newTicket,
    ]);
    return res;
  }

  // para aprobar una papeleta
  static async update(id, dependency) {
    if (dependency !== 1) {
      return await pool.query(
        "UPDATE papeleta_vacacion p SET p.VBjefe = 1 WHERE p.idPapeletaVacacion = ?",
        [id]
      );
    }
  }
}
