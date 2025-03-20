import { Institution } from "../models/institution.model.js";
import { District } from "../models/district.model.js";
import { EducationalLevel } from "../models/educationalLevel.model.js";

/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de instituciones
export const getData = async (req, res) => {
  let forPage = 10;
  let page = req.params.num || 1;
  let ofset = page * forPage - forPage;
  const user = req.session;
  try {
    const institutions = await Institution.getInstitution(ofset);
    const [counts] = await Institution.countInstitutions();
    res.render("institution/index", {
      user,
      institutions,
      current: page,
      pages: Math.ceil(counts.institutions / forPage),
    });
  } catch (error) {
    res.render("institution/index", { user });
  }
};

/* controla lo que se debe mostrar al momento de visitar
la página de crear una nueva IE */
export const getCreate = async (req, res) => {
  const user = req.session;
  try {
    const district = await District.getDistrict();
    const educationalLevel = await EducationalLevel.getEducationalLevel();
    res.render("institution/create", { user, district, educationalLevel });
  } catch (error) {
    res.render("institution/create", { user });
  }
};

/* para guardar en la base de datos la nueva IE,
se consulta a la db, si el código modular no
existe, se guarda y redirecciona al listao de
IIEE, caso contrario se redirecciona a la
pestaña de crear nueva IE */
export const create = async (req, res) => {
  const {
    modularCode,
    district,
    nameInstitution,
    level,
    nameDirector,
    address,
  } = req.body;
  try {
    const [resModularCodeDB] = await Institution.getInstitutionById(
      modularCode
    );
    if (resModularCodeDB === undefined) {
      const resDb = await Institution.create(
        modularCode,
        district,
        level,
        nameInstitution,
        nameDirector,
        address
      );
      if (resDb.affectedRows > 0) {
        res.redirect("/institutions/page1");
      } else {
        res.redirect("/institutions/create");
        throw new Error("Error al agregar registro");
      }
    } else {
      res.redirect("/institutions/create");
      throw new Error("Registro ya existe");
    }
  } catch (error) {
    res.redirect("/institutions/create");
  }
};

export const getById = async (req, res) => {
  const { Id } = req.params;
  console.log(Id);
  const [resModularCodeDB] = await Institution.getInstitutionById(Id);
  console.log(resModularCodeDB);
};
