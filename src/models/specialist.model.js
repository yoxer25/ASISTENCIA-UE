/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "Specialist"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "especialista" de la base de datos */
export class Specialist {
  constructor(personal, specialty) {
    this.idPersonal = personal;
    this.especialidad = specialty;
  }

  // para consultar todos los especialistas registrados en la base de datos
  static async getSpecialists() {
    const [specialist] = await pool.query(
      "SELECT * FROM especialista e INNER JOIN personal p ON p.idPersonal = e.idPersonal WHERE e.estado != 0"
    );
    return specialist;
  }

  // para consultar datos de un especialista por id
  static async getSpecialistById(id) {
    const [specialist] = await pool.query(
      "SELECT * FROM especialista e INNER JOIN personal p ON p.idPersonal = e.idPersonal WHERE e.idEspecialista = ? AND e.estado != 0",
      [id]
    );
    return specialist;
  }

  // para crear nuevo especialista
  static async create(personal, specialty) {
    const newSpecialist = new Specialist(personal, specialty);
    newSpecialist.fechaCreado = helpers.formatDateTime();
    const [res] = await pool.query("INSERT INTO especialista SET ?", [
      newSpecialist,
    ]);
    return res;
  }

  // para actualizar una área
  static async set(id, personal, specialty, _method) {
    if (_method === "PUT") {
      const newSpecialist = new Specialist(personal, specialty);
      newSpecialist.fechaActualizado = helpers.formatDateTime();
      const [res] = await pool.query(
        "UPDATE especialista e SET ? WHERE e.idEspecialista = ?",
        [newSpecialist, id]
      );
      return res;
    }
    if (_method === "PATCH") {
      const newSpecialist = {
        estado: 0,
        fechaEliminado: helpers.formatDateTime(),
      };
      const [res] = await pool.query(
        "UPDATE especialista e SET ? WHERE e.idEspecialista = ?",
        [newSpecialist, id]
      );
      return res;
    }
  }

  /* para consultar datos de una especialidad por idPersonal */
  static async getSpecialistByPersonal(personal) {
    const [specialist] = await pool.query(
      "SELECT * FROM especialista e WHERE e.idPersonal = ? AND e.estado != 0",
      [personal]
    );
    return specialist;
  }
}
