import { password } from "../helpers/password.js";
import { User } from "../models/user.model.js";
import { RolUser } from "../models/rolUser.model.js";
import { Institution } from "../models/institution.model.js";

export const getUsers = async (req, res) => {
  const user = req.session;
  try {
    const users = await User.getUser();
    res.render("user/index", { user, users });
  } catch (error) {
    res.render("user/index", { user });
  }
};

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

export const create = async (req, res) => {
  const { username, formPassword, rolUser } = req.body;
  try {
    const passwordHash = await password.encryptPassword(formPassword);
    const resDb = await User.create(username, rolUser, passwordHash);
    if (resDb.affectedRows > 0) {
      res.redirect("/users");
    } else {
      res.redirect("/users/create");
      throw new Error("Error al agregar registro");
    }
  } catch (error) {
    res.redirect("/institutions/create");
  }
};
