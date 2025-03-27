/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";

/* exportamos nuestra clase "EducationalLevel"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "nivel_educativo" de la base de datos */
export class EducationalLevel {
  // para consultar datos de todos los niveles educativos
  static async getEducationalLevel() {
    const [educationLevel] = await pool.query(
      "SELECT * FROM nivel_educativo n WHERE n.estado != 0"
    );
    if (educationLevel != "") {
      return educationLevel;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un nivel educativo por nombre
  static async getByName(nameLevel) {
    const [educationLevel] = await pool.query(
      "SELECT * FROM nivel_educativo n WHERE n.nombreNivel = ? and n.estado != 0",
      [nameLevel]
    );
    if (educationLevel != "") {
      return educationLevel;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un nivel educativo por id
  static async getByName(idLevel) {
    const [educationLevel] = await pool.query(
      "SELECT * FROM nivel_educativo n WHERE n.idNivelEducativo = ? and n.estado != 0",
      [idLevel]
    );
    if (educationLevel != "") {
      return educationLevel;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  /* para consultar datos de todos los niveles educativos que sean
    diferentes al nivel educativo que tiene registrado la I.E. */
  static async getSelectEducationalLevel(Id) {
    const [categories] = await pool.query(
      "SELECT * FROM nivel_educativo n WHERE NOT EXISTS (SELECT * FROM institucion i WHERE n.idNivelEducativo = i.idNivel AND n.estado != 0 AND i.idInstitucion = ?)",
      [Id]
    );
    if (categories) {
      return categories;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}
