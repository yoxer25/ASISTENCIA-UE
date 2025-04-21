/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "FileProfesor"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "carpeta_docente" de la base de datos */
export class FileProfesor {
  // para consultar datos de todas las carpetas por ie y docente
  static async getFile(ie, anio) {
    const [fileProfesor] = await pool.query(
      "SELECT * FROM carpeta_docente c INNER JOIN personal p ON p.idPersonal = c.idPersonal INNER JOIN anio_escolar ae ON c.idAnio = ae.idAnio WHERE (c.idInstitucion = ? AND c.idAnio = ?) AND c.estado != 0",
      [ie, anio]
    );
    if (fileProfesor != "") {
      return fileProfesor;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para crear carpetas por docente
  static async set(ie, anio, profesor) {
    const newFile = {
      idInstitucion: ie,
      idAnio: anio,
      idPersonal: profesor,
      fechaCreado: helpers.formatDateTime(),
    };

    const [res] = await pool.query("INSERT INTO carpeta_docente SET ?", [
      newFile,
    ]);
    return res;
  }

  // para consultar datos de una carpeta por el ID del docente en dciho año escolar
  static async getById(anio, personal) {
    const [fileProfesor] = await pool.query(
      "SELECT * FROM carpeta_docente c WHERE c.idAnio = ? AND c.idPersonal = ?",
      [anio, personal]
    );
    return fileProfesor;
  }
}
