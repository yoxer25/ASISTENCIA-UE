/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "DocumentIE"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "documento_institucion" de la base de datos */
export class DocumentIE {
  // para consultar los documentos por ie
  static async getDocument(ie) {
    const [documentIE] = await pool.query(
      "SELECT * FROM documento_institucion d WHERE d.idInstitucion = ?",
      [ie]
    );
      return documentIE;
  }

  // para agregar documentos por IE
  static async set(ie, originalname, filename) {
    const newDocument = {
      idInstitucion: ie,
      nombreOriginal: originalname,
      nombreDocumento: filename,
      fechaCreado: helpers.formatDateTime(),
    };
    const [res] = await pool.query("INSERT INTO documento_institucion SET ?", [
      newDocument,
    ]);
    return res;
  }
}
