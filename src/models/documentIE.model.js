/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "DocumentIE"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "documento_institucion" de la base de datos */
export class DocumentIE {
  // para consultar los documentos pdf por ie
  static async getDocument(ie) {
    const [documentIE] = await pool.query(
      "SELECT * FROM documento_institucion d WHERE d.idInstitucion = ? AND d.nombreAnio = 'S/N'",
      [ie]
    );
    return documentIE;
  }

  // para consultar los documentos excel por institución
  static async getDocumentExcel(ie, anio) {
    const [documentIE] = await pool.query(
      "SELECT * FROM documento_institucion d WHERE d.idInstitucion = ? AND d.nombreAnio = ?",
      [ie, anio]
    );
    if (documentIE) {
      return documentIE;
    }
  }

  // para agregar documentos por IE
  static async set(ie, originalname, filename, anio) {
    const newDocument = {
      idInstitucion: ie,
      nombreOriginal: originalname,
      nombreDocumento: filename,
      nombreAnio: anio,
      fechaCreado: helpers.formatDateTime(),
    };
    const [res] = await pool.query("INSERT INTO documento_institucion SET ?", [
      newDocument,
    ]);
    return res;
  }
}
