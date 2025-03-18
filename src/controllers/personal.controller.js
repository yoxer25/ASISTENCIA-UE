import { RolUser } from "../models/rolUser.model.js";
import { Institution } from "../models/institution.model.js";
import { Personal } from "../models/personal.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de trabajadores
export const getPersonal = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  let ofset = page * forPage - forPage;
  const user = req.session;
  const institution = user.user.name;
  try {
    const personals = await Personal.getPersonal(institution, ofset);
    const [counts] = await Personal.countPersonals(institution);
    res.render("personal/index", {
      user,
      personals,
      current: page,
      pages: Math.ceil(counts.personals / forPage),
    });
  } catch (error) {
    res.render("personal/index", { user });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de crear nuevo trabajador
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

/* función para crear un nuevo trabajador, se consulta
a la base de datos si existe un registro con el
número de DNI; si no existe, se guarda en la db */
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
