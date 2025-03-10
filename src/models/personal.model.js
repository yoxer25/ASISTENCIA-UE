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
  constructor(documentNumber, institution, fullName, idReloj) {
    this.idPersonal = documentNumber;
    this.idInstitucion = institution;
    this.nombrePersonal = fullName;
    this.idReloj = idReloj;
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
  static async getPersonal(institution) {
    const [personalDb] = await pool.query(
      "SELECT p.idPersonal, p.nombrePersonal, i.nombreInstitucion FROM personal p INNER JOIN institucion i ON p.idInstitucion = i.idInstitucion WHERE i.idInstitucion = ? and p.estado != 0",
      [institution]
    );
    if (personalDb != "") {
      return personalDb;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar el DNI de un trabajador por idReloj e institucion
  static async getDNI(institution, idReloj) {
    const [DNI] = await pool.query(
      "SELECT p.idPersonal FROM personal p WHERE P.idInstitucion = ? and P.idReloj = ? and p.estado != 0",
      [institution, idReloj]
    );
    if (DNI != "") {
      return DNI;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para crear un nuevo trabajador
  static async create(documentNumber, institution, fullName, idReloj) {
    const newPersonal = new Personal(
      documentNumber,
      institution,
      fullName,
      idReloj
    );
    newPersonal.fechaCreado = await helpers.formatDateTime();
    const [res] = await pool.query("INSERT INTO personal SET ?", [newPersonal]);
    return res;
  }
}
