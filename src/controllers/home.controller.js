import { User } from "../models/user.model.js";
import { Institution } from "../models/institution.model.js";
import { Personal } from "../models/personal.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de vistar la página principal
export const getHome = async (req, res) => {
  const user = req.user;
  const institution = user.name;
  try {
    const totalUsers = await User.countUsers();
    const totalInstitutions = await Institution.countInstitutions();
    const totalPersonals = await Personal.countPersonals(institution);
    res.render("home", { user, totalInstitutions, totalUsers, totalPersonals });
  } catch (error) {
    res.render("home", { user });
  }
};
