/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "DocumentProfesor"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "documento_profesor" de la base de datos */
export class DocumentProfesor {
  // para consultar los documentos por ie, carpeta y docente
  static async getDocument(file) {
    const [documentProfesor] = await pool.query(
      "SELECT * FROM documento_profesor d WHERE d.idCarpeta = ?",
      [file]
    );
    if (documentProfesor != "") {
      return documentProfesor;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para agregar documentos por docente
  static async set(file, originalname, filename) {
    const newDocument = {
      idCarpeta: file,
      nombreOriginal: originalname,
      nombreDocumento: filename,
      fechaCreado: helpers.formatDateTime(),
    };
    const [res] = await pool.query("INSERT INTO documento_profesor SET ?", [
      newDocument,
    ]);
    return res;
  }

  // para consultar datos de una carpeta por el ID del docente en dciho año escolar
  static async getById(anio, personal) {
    const [documentProfesor] = await pool.query(
      "SELECT * FROM carpeta_docente c WHERE c.idAnio = ? AND c.idPersonal = ?",
      [anio, personal]
    );
    return documentProfesor;
  }
}
