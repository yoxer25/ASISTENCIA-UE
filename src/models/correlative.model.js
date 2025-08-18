// importamos la conexión a la base de datos
import pool from "../database/connection.js";

/* exportamos nuestra clase "Correlative"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "correlativo_papeleta" de la base de datos */

export class Correlative {
  // Método encapsulado para papeleta normal (sin reset anual)
  static async generateBallotCorrelative() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Bloqueamos la fila para evitar condiciones de carrera
      const [rows] = await connection.query(
        "SELECT ultimaPapeleta FROM correlativo_papeleta WHERE idCorrelativo = 1 FOR UPDATE"
      );

      let nuevoCorrelativo = rows[0].ultimaPapeleta + 1;

      await connection.query(
        "UPDATE correlativo_papeleta SET ultimaPapeleta = ? WHERE idCorrelativo = 1",
        [nuevoCorrelativo]
      );

      await connection.commit();
      connection.release();

      const correlativoStr = String(nuevoCorrelativo).padStart(6, "0");
      return correlativoStr;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }
}
