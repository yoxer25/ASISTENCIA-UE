import { Institution } from "../models/institution.model.js";
import { SchoolYear } from "../models/schoolYear.model.js";
/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de documentos de gestión
export const getDocuments = async (req, res) => {
  const user = req.session;
  const institutions = await Institution.getInstitution();
  try {
    const schoolYear = await SchoolYear.getSchoolYear();
    res.render("documents/index", { user, institutions, schoolYear });
  } catch (error) {
    res.render("documents/index", { user, institutions });
  }
};

// controla lo que se debe mostrar al momento de visitar la página de documentos de gestión
export const getDocumentByName = async (req, res) => {
    const user = req.session;
    const {nameAnio} = req.params;
    const institutions = await Institution.getInstitution();
    try {
      const schoolYear = await SchoolYear.getSchoolYear();
      res.render("documents/index", { user, institutions, schoolYear });
    } catch (error) {
      res.render("documents/index", { user, institutions });
    }
  };
