/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";

/* exportamos nuestra clase "SchoolYear"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "anio_escolar" de la base de datos */
export class SchoolYear {
  // para consultar datos de todos los años escolares
  static async getSchoolYear() {
    const [schoolYear] = await pool.query(
      "SELECT * FROM anio_escolar a WHERE a.estado != 0"
    );
    if (schoolYear != "") {
      return schoolYear;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}