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
  constructor(username, rolUser, password) {
    this.idInstitucion = username;
    this.idRol = rolUser;
    this.contrasena = password;
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
      "SELECT u.idUsuario, u.idInstitucion, i.nombreInstitucion, r.nombreRol FROM usuarios u INNER JOIN institucion i ON u.idInstitucion = i.idInstitucion INNER JOIN rol_usuario r ON u.idRol = r.idRolUsuario WHERE u.estado != 0 ORDER BY u.idUsuario lIMIT ?, 10",
      [ofset]
    );
    if (userDb != "") {
      return userDb;
    } else {
      throw new Error("Datos no encontrados");
    }
  }

  // para crear un nuevo usuario
  static async create(username, rolUser, password) {
    const newUser = new User(username, rolUser, password);
    newUser.fechaCreado = await helpers.formatDateTime();
    const [res] = await pool.query("INSERT INTO usuarios SET ?", [newUser]);
    return res;
  }

  // para iniciar sesión
  static async login(userModularCode, userpassword) {
    const [user] = await pool.query(
      "SELECT * FROM usuarios u WHERE u.idInstitucion = ?",
      [userModularCode]
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
          rol: nameRol.nombreRol,
        };
        return usuario;
      }
      throw new Error("Datos Incorrectos");
    }
    throw new Error("Datos Incorrectos");
  }
  // para cambiar contraseña del usuario
  /* static async updatePass({ id, newPassword }) {
    const [user] = await pool.query(
      "SELECT * FROM usuarios u WHERE u.idUsuario = ?",
      [id]
    );
    if (user.length > 0) {
      const userData = user[0];
      const password = await bcrytp.hash(newPassword, 10);
      const userUpdate = new SchemaUser(
        userData.idUsuario,
        userData.nombreUsuario,
        userData.dni,
        password,
        userData.estado
      );
      await pool.query("UPDATE usuarios u set ? WHERE u.idUsuario = ?", [
        userUpdate,
        userData.idUsuario,
      ]);
    }
    throw new Error("Datos Incorrectos");
  } */
}
