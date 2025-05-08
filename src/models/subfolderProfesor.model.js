/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "SubFolderProfesor"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "subcarpeta_profesor" de la base de datos */
export class SubFolderProfesor {
  // para consultar datos de todas las subcarpetas por ieque tiene un docente en la IE
  static async getFolder(idFolder) {
    const [subFolderProfesor] = await pool.query(
      "SELECT * FROM subcarpeta_profesor sc INNER JOIN carpeta_docente cd ON cd.idCarpetaDocente = sc.idCarpeta WHERE sc.idCarpeta = ? AND sc.estado != 0",
      [idFolder]
    );
    return subFolderProfesor;
  }

  // para crear subcarpetas por docente
  static async set(idFolder, nameFolder) {
    const newFolder = {
      idCarpeta: idFolder,
      nombreSubcarpeta: nameFolder,
      fechaCreado: helpers.formatDateTime(),
    };

    const [res] = await pool.query("INSERT INTO subcarpeta_profesor SET ?", [
      newFolder,
    ]);
    return res;
  }

  // para consultar datos de una subcarpeta por el ID y el nombre de la subcarpeta
  static async getById(idFolder, nameFolder) {
    const [subFolderProfesor] = await pool.query(
      "SELECT * FROM subcarpeta_profesor sc WHERE sc.idCarpeta = ? AND sc.nombreSubcarpeta = ?",
      [idFolder, nameFolder]
    );
    return subFolderProfesor;
  }
}
