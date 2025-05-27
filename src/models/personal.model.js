/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "Personal"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "usuarios" de la base de datos */
export class Personal {
  constructor(documentNumber, institution, fullName, idReloj, docente) {
    this.dniPersonal = documentNumber;
    this.idInstitucion = institution;
    this.nombrePersonal = fullName;
    this.idReloj = idReloj;
    this.docente = docente;
  }

  // para consultar el número total de trabajadores
  static async countPersonals(institution) {
    const [personals] = await pool.query(
      "SELECT COUNT(*) AS personals FROM personal p INNER JOIN institucion i ON p.idInstitucion = i.idInstitucion WHERE i.idInstitucion = ? and p.estado != 0",
      [institution]
    );
    if (personals) {
      return personals;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar dotos de todos los trabajadores
  static async getPersonal(institution, ofset) {
    if (ofset === undefined) {
      const [personalDb] = await pool.query(
        "SELECT p.idPersonal, p.dniPersonal, p.nombrePersonal, p.docente, i.nombreInstitucion, p.idReloj, t.nombreTurno, a.nombreArea, asig.nombreAsignatura FROM personal p INNER JOIN institucion i ON p.idInstitucion = i.idInstitucion INNER JOIN turno_personal t ON p.idTurnoPersonal = t.idTurnoPersonal INNER JOIN area a ON a.idArea = p.idAreaPersonal INNER JOIN asignatura asig ON p.asignatura = asig.idAsignatura WHERE i.idInstitucion = ? and p.estado != 0 ORDER BY p.dniPersonal",
        [institution]
      );

      return personalDb;
    } else {
      const [personalDb] = await pool.query(
        "SELECT p.idPersonal, p.dniPersonal, p.nombrePersonal, p.docente, i.nombreInstitucion, p.idReloj, t.nombreTurno, a.nombreArea, asig.nombreAsignatura FROM personal p INNER JOIN institucion i ON p.idInstitucion = i.idInstitucion INNER JOIN turno_personal t ON p.idTurnoPersonal = t.idTurnoPersonal INNER JOIN area a ON a.idArea = p.idAreaPersonal INNER JOIN asignatura asig ON p.asignatura = asig.idAsignatura WHERE i.idInstitucion = ? and p.estado != 0 ORDER BY p.dniPersonal lIMIT ?, 10",
        [institution, ofset]
      );
      if (personalDb != "") {
        return personalDb;
      } else {
        throw new Error("Datos no encontrados");
      }
    }
  }

  // para consultar el idPersonal de un trabajador por idReloj e institucion
  static async getId(institution, idReloj) {
    const [id] = await pool.query(
      "SELECT p.idPersonal, t.nombreTurno FROM personal p INNER JOIN turno_personal t ON p.idTurnoPersonal = t.idTurnoPersonal WHERE p.idInstitucion = ? and p.idReloj = ? and p.estado != 0",
      [institution, idReloj]
    );
    if (id != "") {
      return id;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar por DNI si un trabajador ya está registrado en dicha institución
  static async getForCreate(dni, institution) {
    const [DNI] = await pool.query(
      "SELECT * FROM personal p WHERE p.dniPersonal = ? and p.idInstitucion = ?",
      [dni, institution]
    );
    return DNI;
  }

  // para consultar si el idReloj de un trabajador ya está registrado en dicha institución
  static async getIdReloj(institution, idReloj) {
    const [reloj] = await pool.query(
      "SELECT * FROM personal p WHERE p.idInstitucion = ? and p.idReloj = ?",
      [institution, idReloj]
    );
    return reloj;
  }

  // para crear un nuevo trabajador
  static async set(
    documentNumber,
    institution,
    fullName,
    idReloj,
    turnPersonal,
    area,
    docente,
    course,
    Id,
    _method
  ) {
    const newPersonal = new Personal(
      documentNumber,
      institution,
      fullName,
      idReloj,
      docente
    );
    if (!_method) {
      if (area === undefined) {
        newPersonal.idAreaPersonal = 1;
      } else {
        newPersonal.idAreaPersonal = area;
      }

      if (course === undefined) {
        newPersonal.asignatura = 1;
      } else {
        newPersonal.asignatura = course;
      }
      newPersonal.idTurnoPersonal = turnPersonal;
      newPersonal.fechaCreado = helpers.formatDateTime();
      const [res] = await pool.query("INSERT INTO personal SET ?", [
        newPersonal,
      ]);
      return res;
    }
    if (_method === "PUT") {
      if (area === undefined) {
        newPersonal.idAreaPersonal = 1;
      } else {
        newPersonal.idAreaPersonal = area;
      }

      if (course === undefined) {
        newPersonal.asignatura = 1;
      } else {
        newPersonal.asignatura = course;
      }
      newPersonal.fechaActualizado = helpers.formatDateTime();
      const [res] = await pool.query(
        "UPDATE personal p SET ? WHERE p.idPersonal = ?",
        [newPersonal, Id]
      );
      return res;
    }

    if (_method === "PATCH") {
      const newPersonal = {
        estado: 0,
        fechaEliminado: helpers.formatDateTime()
      }
      const [res] = await pool.query(
        "UPDATE personal p SET ? WHERE p.idPersonal = ?",
        [newPersonal, Id]
      );
      return res;
    }
  }

  // para consultar dotos de todos de un trabajador por ID
  static async getPersonalById(Id) {
    const [personalDb] = await pool.query(
      "SELECT p.idPersonal, p.dniPersonal, p.nombrePersonal, p.idReloj, p.idTurnoPersonal, p.idAreaPersonal, p.docente, t.nombreTurno, a.nombreArea, p.asignatura, asig.nombreAsignatura FROM personal p INNER JOIN turno_personal t ON p.idTurnoPersonal = t.idTurnoPersonal INNER JOIN asignatura asig ON p.asignatura = asig.idAsignatura INNER JOIN area a ON a.idArea = p.idAreaPersonal WHERE p.idPersonal = ?",
      [Id]
    );
    if (personalDb != "") {
      return personalDb;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
  // para consultar dotos de todos de un trabajador por dni
  static async getPersonalByDNI(dni) {
    const [personalDb] = await pool.query(
      "SELECT p.nombrePersonal, p.idPersonal, a.nombreArea, a.idArea FROM personal p INNER JOIN area a ON a.idArea = p.idAreaPersonal WHERE p.dniPersonal = ?",
      [dni]
    );
    return personalDb;
  }
}
