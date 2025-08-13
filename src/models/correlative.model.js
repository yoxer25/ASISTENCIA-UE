// importamos la conexión a la base de datos
import pool from "../database/connection.js";

/* exportamos nuestra clase "Correlative"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "correlativo_papeleta" de la base de datos */
export class Correlative {
  /* para obtener el último correlativo de las papeletas de comisión
  de servicios y/o permisos */
  static async getCorrelative() {
    const [receipt] = await pool.query(
      "SELECT ultimaPapeleta FROM correlativo_papeleta WHERE idCorrelativo = 1"
    );
    return receipt;
  }

  /* para actualizar el último correlativo de las papeletas de
  comisión de servicios y/o permisos */
  static async updateCorrelative(lastCorrelative) {
    const [receipt] = await pool.query(
      "UPDATE correlativo_papeleta SET ultimaPapeleta = ? WHERE idCorrelativo = 1",
      [lastCorrelative]
    );
    return receipt;
  }

  /* para obtener el último correlativo de las papeletas de vacaciones */
  static async getCorrelativeVacation() {
    const [receipt] = await pool.query(
      "SELECT ultimaPapeleta FROM correlativo_papeleta WHERE idCorrelativo = 2"
    );
    return receipt;
  }

  /* para actualizar el último correlativo de las papeletas de vacaciones */
  static async updateCorrelativeVacation(lastCorrelative) {
    const [receipt] = await pool.query(
      "UPDATE correlativo_papeleta SET ultimaPapeleta = ? WHERE idCorrelativo = 2",
      [lastCorrelative]
    );
    return receipt;
  }
}