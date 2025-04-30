/* importamos:
pool: para conexión a base de datos,
helpers: para formatear las fechas a guardar en la base de datos,
password: para comparar la contraseña del usuario */
import pool from "../database/connection.js";
import { helpers } from "../helpers/helper.js";
import { password } from "../helpers/password.js";
import { RolUser } from "./rolUser.model.js";

/* exportamos nuestra clase "User"
para poder utilizar sus métodos en otros
archivos del proyecto. Esta clase hace referencia
a la tabla "usuarios" de la base de datos */
export class User {
  constructor(username, rolUser, dniUser) {
    this.idInstitucion = username;
    this.idRol = rolUser;
    this.dni_usuario = dniUser;
  }

  // para consultar el número total de usuarios
  static async countUsers() {
    const [users] = await pool.query(
      "SELECT COUNT(*) AS users FROM usuarios u WHERE u.estado != 0"
    );
    if (users) {
      return users;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar dotos de todos los usuarios
  static async getUser(ofset) {
    const [userDb] = await pool.query(
      "SELECT u.idUsuario, u.idInstitucion, u.dni_usuario, u.idRol, i.nombreInstitucion, n.nombreNivel, r.nombreRol FROM usuarios u INNER JOIN institucion i ON u.idInstitucion = i.idInstitucion INNER JOIN nivel_educativo n ON i.idNivel = n.idNivelEducativo INNER JOIN rol_usuario r ON u.idRol = r.idRolUsuario WHERE u.estado != 0 AND u.idUsuario != 1 ORDER BY u.idUsuario lIMIT ?, 10",
      [ofset]
    );
    if (userDb != "") {
      return userDb;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar dotos de un usuario por id
  static async getUserById(Id) {
    const [userDb] = await pool.query(
      "SELECT u.idUsuario, u.idInstitucion, u.dni_usuario, u.idRol, i.nombreInstitucion, r.nombreRol FROM usuarios u INNER JOIN institucion i ON u.idInstitucion = i.idInstitucion INNER JOIN rol_usuario r ON u.idRol = r.idRolUsuario WHERE u.estado != 0 AND u.idUsuario = ?",
      [Id]
    );
    if (userDb != "") {
      return userDb;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para consultar dotos de usuarios por nombre de I.E
  static async search(name) {
    const [userDb] = await pool.query(
      `SELECT u.idUsuario, u.idInstitucion, u.dni_usuario, i.nombreInstitucion, n.nombreNivel, r.nombreRol FROM usuarios u INNER JOIN institucion i ON u.idInstitucion = i.idInstitucion INNER JOIN nivel_educativo n ON i.idNivel = n.idNivelEducativo INNER JOIN rol_usuario r ON u.idRol = r.idRolUsuario WHERE u.estado != 0 AND i.nombreInstitucion LIKE '%${name}%' ORDER BY u.idUsuario`
    );
    if (userDb != "") {
      return userDb;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para crear un nuevo usuario
  static async create(username, rolUser, password, dniUser) {
    const newUser = new User(username, rolUser, dniUser);
    newUser.contrasena = password;
    newUser.fechaCreado = helpers.formatDateTime();
    const [res] = await pool.query("INSERT INTO usuarios SET ?", [newUser]);
    return res;
  }

  // para actualizar datos de un nuevo usuario
  static async set(username, rolUser, Id, _method) {
    const newUser = new User(username, rolUser);
    if (_method === "PUT") {
      newUser.fechaActualizado = helpers.formatDateTime();
      const [res] = await pool.query(
        "UPDATE usuarios u SET ? WHERE u.idUsuario = ?",
        [newUser, Id]
      );
      return res;
    }

    if (_method === "PATCH") {
      newUser.estado = 0;
      newUser.fechaEliminado = helpers.formatDateTime();
      const [res] = await pool.query(
        "UPDATE usuarios u SET ? WHERE u.idUsuario = ?",
        [newUser, Id]
      );
      return res;
    }
  }

  // para iniciar sesión
  static async login(userName, userpassword) {
    const [user] = await pool.query(
      "SELECT * FROM usuarios u WHERE u.dni_usuario = ? AND u.estado != 0",
      [userName]
    );
    if (user.length > 0) {
      const userData = user[0];
      const validPassword = await password.matchPassword(
        userpassword,
        userData.contrasena
      );
      if (validPassword) {
        const rol = await RolUser.getById(userData.idRol);
        const nameRol = rol[0];
        const usuario = {
          idUser: userData.idUsuario,
          nombre: userData.idInstitucion,
          dniUser: userData.dni_usuario,
          rol: nameRol.nombreRol,
        };
        return usuario;
      }
      throw new Error("Datos Incorrectos");
    }
    throw new Error("Datos Incorrectos");
  }

  // para cambiar contraseña del usuario
  static async updatePassword(id, password) {
    const newUser = {
      contrasena: password,
      fechaActualizado: helpers.formatDateTime(),
    }
    const [res] = await pool.query(
      "UPDATE usuarios u SET ? WHERE u.idUsuario = ?",
      [newUser, id]
    );
    return res;
  }
}
