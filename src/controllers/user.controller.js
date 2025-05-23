import { password } from "../helpers/password.js";
import { User } from "../models/user.model.js";
import { RolUser } from "../models/rolUser.model.js";
import { Institution } from "../models/institution.model.js";
import { Area } from "../models/area.model.js";
import { Personal } from "../models/personal.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de usuarios
export const getUsers = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  let ofset = page * forPage - forPage;
  const user = req.user;
  try {
    const usersDB = await User.getUser(ofset);
    const users = [];
    for (let i = 0; i < usersDB.length; i++) {
      const element = usersDB[i];
      let name = element.nombreInstitucion;
      const [personal] = await Personal.getPersonalByDNI(element.dni_usuario);
      if (personal) {
        name = personal.nombrePersonal;
      }
      const newUser = {
        idUsuario: element.idUsuario,
        idInstitucion: element.idInstitucion,
        idRol: element.idRol,
        nombreNivel: element.nombreNivel,
        nombreInstitucion: element.nombreInstitucion,
        dni_usuario: element.dni_usuario,
        nombres: name,
        nombreRol: element.nombreRol,
        correo: element.correo,
      };
      users.push(newUser);
    }
    const [counts] = await User.countUsers();
    res.render("user/index", {
      user,
      users,
      current: page,
      pages: Math.ceil(counts.users / forPage),
    });
  } catch (error) {
    res.render("user/index", { user });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de crear nuevo usuario
export const getCreate = async (req, res) => {
  const user = req.user;
  try {
    const rolUser = await RolUser.getRolUser();
    const institution = await Institution.getInstitution();
    const areas = await Area.getAreas();
    res.render("user/create", { user, rolUser, institution, areas });
  } catch (error) {
    res.render("user/create", { user });
  }
};

// función para guardar nuevo usuario en la base de datos

/* Si a través del formulario nos envían el _method PUT
o PATCH, se actualizará la información del usuario;
caso contrario, si no se envía el _method, se procederá
a crear un nuevo usuario */
export const set = async (req, res) => {
  const { username, formPassword, rolUser, email, _method } = req.body;
  let { dni } = req.body;
  if (dni) {
    dni = dni;
  } else {
    dni = username;
  }
  const { Id } = req.params;
  try {
    if (_method) {
      const resDb = await User.set(username, rolUser, Id, _method, dni, email);
      if (resDb.affectedRows > 0) {
        // Si el registro es exitoso
        res.cookie("success", ["¡Actualización exitosa!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        res.redirect("/users/page1");
      } else {
        // Si el registro falla
        res.cookie("error", ["¡Error al actualizar registro!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Error al actualizar registro");
      }
    } else {
      validationInput(username, formPassword, rolUser, email, res);
      const passwordHash = await password.encryptPassword(formPassword);
      const resDb = await User.create(
        username,
        rolUser,
        passwordHash,
        dni,
        email
      );
      if (resDb.affectedRows > 0) {
        // Si el registro es exitoso
        res.cookie("success", ["¡Registro exitoso!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        res.redirect("/users/page1");
      } else {
        // Si el registro falla
        res.cookie("error", ["¡Error al agregar registro!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Error al agregar registro");
      }
    }
  } catch (error) {
    res.redirect("/users/create");
  }
};

// controla lo que se debe mostrar al momento de visitar la página de actualizar datos de un trabajador
export const getById = async (req, res) => {
  const user = req.user;
  try {
    const { Id } = req.params;
    const [userDB] = await User.getUserById(Id);
    const rolUser = await RolUser.getSelectRolUser(Id);
    res.render("user/update", {
      user,
      userDB,
      rolUser,
    });
  } catch (error) {
    res.render("user/update", { user });
  }
};

// para buscar usuarios por nombre de I.E
export const search = async (req, res) => {
  const user = req.user;
  try {
    const { ie } = req.body;
    if (ie) {
      const users = await User.search(ie);
      res.render("user/index", {
        user,
        users,
      });
    } else {
      res.redirect("/users/page1");
    }
  } catch (error) {
    res.render("user/index", { user });
  }
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar productos
const validationInput = (username, formPassword, rolUser, email, res) => {
  if (
    username === "" ||
    formPassword === "" ||
    rolUser === "" ||
    email === ""
  ) {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("Todos los campos son obligatorios");
  }
};
