/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "Area"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "area" de la base de datos */
export class Area {
  constructor(name, designatedPerson) {
    this.nombreArea = name;
    this.responsable = designatedPerson;
  }

  // para consultar todas las áreas registradas en la base de datos
  static async getAreas() {
    const [areas] = await pool.query(
      "SELECT * FROM area a INNER JOIN personal p ON p.idPersonal = a.responsable WHERE a.estado != 0"
    );
    return areas;
  }

  // para consultar datos de una área por id
  static async getAreaById(id) {
    const [areas] = await pool.query(
      "SELECT * FROM area a INNER JOIN personal p ON p.idPersonal = a.responsable WHERE a.idArea = ? AND a.estado != 0",
      [id]
    );
    return areas;
  }

  // para crear nueva área
  static async create(name, designatedPerson) {
    const newArea = new Area(name, designatedPerson);
    newArea.fechaCreado = helpers.formatDateTime();
    const [res] = await pool.query("INSERT INTO area SET ?", [newArea]);
    return res;
  }

  // para actualizar una área
  static async set(id, name, designatedPerson, _method) {
    if (_method === "PUT") {
      const newArea = new Area(name, designatedPerson);
      newArea.fechaActualizado = helpers.formatDateTime();
      const [res] = await pool.query("UPDATE area a SET ? WHERE a.idArea = ?", [
        newArea,
        id,
      ]);
      return res;
    }
    if (_method === "PATCH") {
      const newArea = {
        estado: 0,
        fechaEliminado: helpers.formatDateTime(),
      };
      const [res] = await pool.query("UPDATE area a SET ? WHERE a.idArea = ?", [
        newArea,
        id,
      ]);
      return res;
    }
  }
}
