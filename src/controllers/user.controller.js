import { password } from "../helpers/password.js";
import { User } from "../models/user.model.js";
import { RolUser } from "../models/rolUser.model.js";
import { Institution } from "../models/institution.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de usuarios
export const getUsers = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  let ofset = page * forPage - forPage;
  const user = req.session;
  try {
    const users = await User.getUser(ofset);
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
  const user = req.session;
  try {
    const rolUser = await RolUser.getRolUser();
    const institution = await Institution.getInstitution();
    res.render("user/create", { user, rolUser, institution });
  } catch (error) {
    res.render("user/create", { user });
  }
};

// función para guardar nuevo usuario en la base de datos
export const create = async (req, res) => {
  const { username, formPassword, rolUser } = req.body;
  try {
    const passwordHash = await password.encryptPassword(formPassword);
    const resDb = await User.create(username, rolUser, passwordHash);
    if (resDb.affectedRows > 0) {
      res.redirect("/users/page1");
    } else {
      res.redirect("/users/create");
      throw new Error("Error al agregar registro");
    }
  } catch (error) {
    res.redirect("/users/create");
  }
};
