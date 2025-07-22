// importamos la conexión a la base de datos
import pool from "../database/connection.js";

/* exportamos nuestra clase "Correlative"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "correlativo_papeleta" de la base de datos */
export class Correlative {
  // para obtener el último correlativo
  static async getCorrelative() {
    const [receipt] = await pool.query(
      "SELECT ultimaPapeleta FROM correlativo_papeleta WHERE nombre = 'papeleta'"
    );
    return receipt;
  }

  // para actualizar el último correlativo
  static async updateCorrelative(lastCorrelative) {
    const [receipt] = await pool.query(
      "UPDATE correlativo_papeleta SET ultimaPapeleta = ? WHERE nombre = 'papeleta'",
      [lastCorrelative]
    );
    return receipt;
  }
}