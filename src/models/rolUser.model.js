/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";

/* exportamos nuestra clase "RolUser"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "rol_usuario" de la base de datos */
export class RolUser {
  // para consultar datos de todos los roles
  static async getRolUser() {
    const [rolUser] = await pool.query(
      "SELECT * FROM rol_usuario r WHERE r.estado != 0"
    );
    if (rolUser != "") {
      return rolUser;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un rol por nombre
  static async getByName(nameRolUser) {
    const [rolUser] = await pool.query(
      "SELECT * FROM rol_usuario r WHERE r.nombreRol = ? and r.estado != 0",
      [nameRolUser]
    );
    if (rolUser != "") {
      return rolUser;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de un rol por id
  static async getById(idRolUser) {
    const [rolUser] = await pool.query(
      "SELECT * FROM rol_usuario r WHERE r.idRolUsuario = ? AND r.estado != 0",
      [idRolUser]
    );
    if (rolUser != "") {
      return rolUser;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}
