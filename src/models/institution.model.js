/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";

/* exportamos nuestra clase "Institution"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "institucion" de la base de datos */
export class Institution {
  constructor(
    modularCode,
    district,
    level,
    nameInstitution,
    nameDirector,
    address
  ) {
    this.idInstitucion = modularCode;
    this.idDistrito = district;
    this.idNivel = level;
    this.nombreInstitucion = nameInstitution;
    this.nombreDirector = nameDirector;
    this.direccion = address;
  }

  // para consultar el número total de instituciones
  static async countInstitutions() {
    const [institution] = await pool.query(
      "SELECT COUNT(*) AS institutions FROM institucion i WHERE i.estado != 0"
    );
    if (institution) {
      return institution;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar datos de las instituciones
  static async getInstitution(ofset) {
    if (ofset !== undefined) {
      const [institution] = await pool.query(
        "SELECT * FROM institucion i INNER JOIN distrito d ON i.idDistrito = d.idDistrito INNER JOIN nivel_educativo n ON i.idNivel = n.idNivelEducativo INNER JOIN turno_institucion t ON i.idTurnoInstitucion = t.idTurnoInstitucion INNER JOIN horario_institucion h ON i.idHorarioInstitucion = h.idHorarioInstitucion WHERE i.estado != 0 ORDER BY i.idInstitucion lIMIT ?, 10",
        [ofset]
      );
      if (institution != "") {
        return institution;
      } else {
        throw new Error("Datos no encontrados");
      }
    } else {
      const [institution] = await pool.query(
        "SELECT * FROM institucion i INNER JOIN distrito d ON i.idDistrito = d.idDistrito INNER JOIN nivel_educativo n ON i.idNivel = n.idNivelEducativo INNER JOIN turno_institucion t ON i.idTurnoInstitucion = t.idTurnoInstitucion INNER JOIN horario_institucion h ON i.idHorarioInstitucion = h.idHorarioInstitucion WHERE i.estado != 0"
      );
      if (institution != "") {
        return institution;
      } else {
        throw new Error("Datos no encontrados");
      }
    }
  }

  // para consultar datos de una institución por id
  static async getInstitutionById(id) {
    const [institution] = await pool.query(
      "SELECT * FROM institucion i INNER JOIN distrito d ON i.idDistrito = d.idDistrito INNER JOIN nivel_educativo n ON i.idNivel = n.idNivelEducativo INNER JOIN turno_institucion t ON i.idTurnoInstitucion = t.idTurnoInstitucion INNER JOIN horario_institucion h ON i.idHorarioInstitucion = h.idHorarioInstitucion WHERE i.idInstitucion = ?",
      id
    );
    if (institution) {
      return institution;
    }
  }

  // para consultar datos de una institución por nombre
  static async getInstitutionByName(name) {
    const [institution] = await pool.query(
      `SELECT * FROM institucion i INNER JOIN distrito d ON i.idDistrito = d.idDistrito INNER JOIN nivel_educativo n ON i.idNivel = n.idNivelEducativo INNER JOIN turno_institucion t ON i.idTurnoInstitucion = t.idTurnoInstitucion INNER JOIN horario_institucion h ON i.idHorarioInstitucion = h.idHorarioInstitucion WHERE i.nombreInstitucion LIKE '%${name}%' AND i.estado != 0 ORDER BY i.idInstitucion`
    );
    if (institution) {
      return institution;
    }
  }

  /* para guardar datos de una institución, si se recibe
  un "id", se actualiza la información de la institución
  que corresponda según el método de la ruta; caso contrario,
  se crea una nueva I.E */
  static async set(
    modularCode,
    district,
    level,
    nameInstitution,
    nameDirector,
    address,
    turnInstitution,
    scheduleInstitution,
    Id,
    _method
  ) {
    const newInstitution = new Institution(
      modularCode,
      district,
      level,
      nameInstitution,
      nameDirector,
      address
    );
    if (!_method) {
      newInstitution.idTurnoInstitucion = turnInstitution;
      (newInstitution.idHorarioInstitucion = scheduleInstitution),
        (newInstitution.fechaCreado = await helpers.formatDateTime());
      const [res] = await pool.query("INSERT INTO institucion SET ?", [
        newInstitution,
      ]);
      return res;
    }
    if (_method === "PUT") {
      newInstitution.fechaActualizado = await helpers.formatDateTime();
      const [res] = await pool.query(
        "UPDATE institucion i SET ? WHERE i.idInstitucion = ?",
        [newInstitution, Id]
      );
      return res;
    }

    if (_method === "PATCH") {
      newInstitution.estado = 0;
      newInstitution.fechaEliminado = await helpers.formatDateTime();
      const [res] = await pool.query(
        "UPDATE institucion i SET ? WHERE i.idInstitucion = ?",
        [newInstitution, Id]
      );
      return res;
    }
  }
}
