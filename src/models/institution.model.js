/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "Institution"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "institucion" de la base de datos */
export class Institution {
  constructor(
    modularCode,
    district,
    level,
    nameInstitution,
    nameDirector,
    address
  ) {
    this.idInstitucion = modularCode;
    this.idDistrito = district;
    this.idNivel = level;
    this.nombreInstitucion = nameInstitution;
    this.nombreDirector = nameDirector;
    this.direccion = address;
  }

  // para consultar el número total de instituciones
  static async countInstitutions() {
    const [institution] = await pool.query(
      "SELECT COUNT(*) AS institutions FROM institucion i WHERE i.estado != 0"
    );
    if (institution) {
      return institution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de las instituciones
  static async getInstitution(ofset) {
    if (ofset >= 0) {
      const [institution] = await pool.query(
        "SELECT * FROM institucion i INNER JOIN distrito d ON i.idDistrito = d.idDistrito INNER JOIN nivel_educativo n ON i.idNivel = n.idNivelEducativo WHERE i.estado != 0 ORDER BY i.idInstitucion lIMIT ?, 10",
        [ofset]
      );
      if (institution != "") {
        return institution;
      } else {
        throw new Error("Datos no encontrados");
      }
    } else {
      const [institution] = await pool.query(
        "SELECT * FROM institucion i INNER JOIN distrito d ON i.idDistrito = d.idDistrito INNER JOIN nivel_educativo n ON i.idNivel = n.idNivelEducativo WHERE i.estado != 0"
      );
      if (institution != "") {
        return institution;
      } else {
        throw new Error("Datos no encontrados");
      }
    }
  }

  // para consultar datos de una institución por id
  static async getInstitutionById(id) {
    const [institution] = await pool.query(
      "SELECT * FROM institucion i WHERE i.idInstitucion = ?",
      id
    );
    if (institution) {
      return institution;
    }
  }

  // para consultar datos de una institución por nombre
  static async getInstitutionByName(name) {
    const [institution] = await pool.query(
      `SELECT * FROM institucion i WHERE i.nombreInstitucion = "${name}"`
    );
    if (institution) {
      return institution;
    }
  }

  // para crear una nueva institución
  static async create(
    modularCode,
    district,
    level,
    nameInstitution,
    nameDirector,
    address
  ) {
    const newInstitution = new Institution(
      modularCode,
      district,
      level,
      nameInstitution,
      nameDirector,
      address
    );
    newInstitution.fechaCreado = await helpers.formatDateTime();
    const [res] = await pool.query("INSERT INTO institucion SET ?", [
      newInstitution,
    ]);
    return res;
  }
}
