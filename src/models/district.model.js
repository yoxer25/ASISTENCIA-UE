/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";

/* exportamos nuestra clase "District"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "distrito" de la base de datos */
export class District {
  // para consultar datos de todos los distritos
  static async getDistrict() {
    const [district] = await pool.query(
      "SELECT * FROM distrito d WHERE d.estado != 0"
    );
    if (district != "") {
      return district;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un distrito por nombre
  static async getByName(nameDistrict) {
    const [district] = await pool.query(
      "SELECT * FROM distrito d WHERE d.nombreDistrito = ? and d.estado != 0",
      [nameDistrict]
    );
    if (district != "") {
      return district;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un distrito por id
  static async getById(idDistrict) {
    const [district] = await pool.query(
      "SELECT * FROM distrito d WHERE d.idDistrito = ? d.estado != 0",
      [idDistrict]
    );
    if (district != "") {
      return district;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}
