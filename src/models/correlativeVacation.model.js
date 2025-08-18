// importamos la conexión a la base de datos
import pool from "../database/connection.js";

/* exportamos nuestra clase "CorrelativeVacation"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "correlativo_vacacion" de la base de datos */
export class CorrelativeVacation {
  static async generateCorrelativo() {
    const anioActual = new Date().getFullYear();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verifica existencia del año
      const [existing] = await connection.query(
        "SELECT anio FROM correlativo_vacacion WHERE anio = ?",
        [anioActual]
      );

      if (existing.length === 0) {
        await connection.query(
          "INSERT INTO correlativo_vacacion (anio, ultimaPapeleta) VALUES (?, 0)",
          [anioActual]
        );
      }

      // Bloquea fila y obtiene último correlativo
      const [rows] = await connection.query(
        "SELECT ultimaPapeleta FROM correlativo_vacacion WHERE anio = ? FOR UPDATE",
        [anioActual]
      );

      let nuevoCorrelativo = rows[0].ultimaPapeleta + 1;

      await connection.query(
        "UPDATE correlativo_vacacion SET ultimaPapeleta = ? WHERE anio = ?",
        [nuevoCorrelativo, anioActual]
      );

      await connection.commit();
      connection.release();

      const correlativoStr = String(nuevoCorrelativo).padStart(4, "0");
      return `${correlativoStr}-${anioActual}`;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }
}
