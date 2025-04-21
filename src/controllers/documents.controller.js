// para cambiar nombre del pdf a guardar
import fs from "node:fs";
import { FileProfesor } from "../models/fileProfesor.model.js";
import { Institution } from "../models/institution.model.js";
import { Personal } from "../models/personal.model.js";
import { SchoolYear } from "../models/schoolYear.model.js";
import { DocumentProfesor } from "../models/document.model.js";
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

// para consultar documentos por IE (solo administrador)
export const getDocumentsByIE = async (req, res) => {
  const { ie } = req.body;
  console.log(ie);
};

/* controla lo que se debe mostrar al momento de visitar la
página de documentos por año, aquí veremos las carpetas
por cada docente */
export const getDocumentByName = async (req, res) => {
  const user = req.session;
  const ie = user.user.name;
  const { anio } = req.params;
  try {
    const [schoolYear] = await SchoolYear.getSchoolYearByName(anio);
    const profesor = await Personal.getPersonal(ie);
    const fileProfesor = await FileProfesor.getFile(ie, schoolYear.idAnio);
    res.render("documents/indexByAnio", { user, profesor, fileProfesor, anio });
  } catch (error) {
    res.render("documents/indexByAnio", { user });
  }
};

/* controla lo que se debe mostrar al momento de visitar la
página de documentos por año, aquí veremos las carpetas
por cada docente */
export const getDocumentByProfesor = async (req, res) => {
  const user = req.session;
  const { idCarpeta } = req.params;
  try {
    const documents = await DocumentProfesor.getDocument(idCarpeta);
    res.render("documents/indexByProfesor", { user, idCarpeta, documents });
  } catch (error) {
    res.render("documents/indexByProfesor", { user });
  }
};

// para agregar carpetas para los docentes de cada IE
export const fileProfesor = async (req, res) => {
    const user = req.session;
  const ie = user.user.name;
  const { anio } = req.params;
  const { profesor } = req.body;

  try {
  const [schoolYear] = await SchoolYear.getSchoolYearByName(anio);
    const [fileProfesor] = await FileProfesor.getById(
      schoolYear.idAnio,
      profesor
    );
    if (!fileProfesor) {
      const resDB = await FileProfesor.set(ie, schoolYear.idAnio, profesor);
      if (resDB.affectedRows > 0) {
        // Si el registro es exitoso
        res.cookie("success", ["Registro exitoso!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        res.redirect(`/documents/${anio}`);
      } else {
        // Si el registro falla
        res.cookie("error", ["¡Error al agregar registro!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Error al agregar registro");
      }
    } else {
      // Si el registro falla
      res.cookie("error", ["¡Registro ya existe!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Registro ya existe");
    }
  } catch (error) {
    res.redirect(`/documents/${anio}`);
  }
};

// para agregar documentos para los docentes de cada IE
export const documentProfesor = async (req, res) => {
  const { idCarpeta } = req.params;
  try {
    if (req.file) {
      const { mimetype } = req.file;
      const { originalname } = req.file;
      if (mimetype === "application/pdf") {
        savePDF(req.file);
        const resDB = await DocumentProfesor.set(idCarpeta, originalname);
        if (resDB.affectedRows > 0) {
          // Si el registro es exitoso
          res.cookie("success", ["¡Registro exitoso!"], {
            httpOnly: true,
            maxAge: 6000,
          }); // 6 segundos
          res.redirect("/documents");
        } else {
          // Si el registro falla
          res.cookie("error", ["¡Error al agregar registro!"], {
            httpOnly: true,
            maxAge: 6000,
          }); // 6 segundos
          throw new Error("Error al agregar registro");
        }
      } else {
        res.cookie("error", ["¡Seleccione un archivo pdf!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Seleccione un archivo .pdf");
      }
    } else {
      res.cookie("error", ["¡Seleccione un archivo pdf!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Seleccione un archivo .pdf");
    }
  } catch (error) {
    res.redirect("/documents");
  }
};

// función para que el pdf subido se guarde con su nombre original dentro de la carpeta "src/public/documents"
const savePDF = (file) => {
  const newPath = `./src/public/documents/${file.originalname}`;
  fs.renameSync(file.path, newPath);
  return newPath;
};
