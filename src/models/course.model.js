/* importamos:
pool: para conexión a base de datos */
import pool from "../database/connection.js";

/* exportamos nuestra clase "Course"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "asignatura" de la base de datos */
export class Course {
  // para consultar datos de todos los años escolares
  static async getCourses() {
    const [course] = await pool.query(
      "SELECT * FROM asignatura a WHERE a.estado != 0 AND a.nombreAsignatura != 'GENERAL'"
    );
    if (course != "") {
      return course;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
  /* para consultar datos de todos los turnos que sean
  diferentes al turno que tiene registrado el trabajador */
  static async getSelectCourses(Id) {
    const [course] = await pool.query(
      "SELECT * FROM asignatura a WHERE a.estado != 0 AND a.nombreAsignatura != 'GENERAL' AND NOT EXISTS (SELECT * FROM personal p WHERE a.idAsignatura = p.asignatura AND p.idPersonal = ? ORDER BY a.idAsignatura)",
      [Id]
    );
    if (course) {
      return course;
    } else {
      throw new Error("Datos no encontrados");
    }
  }
}