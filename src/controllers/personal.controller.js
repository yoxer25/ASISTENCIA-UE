import { RolUser } from "../models/rolUser.model.js";
import { Institution } from "../models/institution.model.js";
import { Personal } from "../models/personal.model.js";

export const getPersonal = async (req, res) => {
  const user = req.session;
  const institution = user.user.name;
  try {
    const personals = await Personal.getPersonal(institution);
    res.render("personal/index", { user, personals });
  } catch (error) {
    res.render("personal/index", { user });
  }
};

export const getCreate = async (req, res) => {
  const user = req.session;
  try {
    const rolUser = await RolUser.getRolUser();
    const institution = await Institution.getInstitution();
    res.render("personal/create", { user, rolUser, institution });
  } catch (error) {
    res.render("personal/create", { user });
  }
};

export const create = async (req, res) => {
  const user = req.session;
  const institution = user.user.name;
  const { documentNumber, fullName, idReloj } = req.body;
  try {
    const resDb = await Personal.create(
      documentNumber,
      institution,
      fullName,
      idReloj
    );
    if (resDb.affectedRows > 0) {
      res.redirect("/personals");
    } else {
      res.redirect("/personals/create");
      throw new Error("Error al agregar registro");
    }
  } catch (error) {
    res.redirect("/personals/create");
  }
};
