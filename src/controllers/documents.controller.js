// para cambiar nombre del pdf a guardar
import fs from "node:fs";
import path from "path"; //
import { fileURLToPath } from "url";
import { FileProfesor } from "../models/fileProfesor.model.js";
import { Institution } from "../models/institution.model.js";
import { Personal } from "../models/personal.model.js";
import { SchoolYear } from "../models/schoolYear.model.js";
import { DocumentProfesor } from "../models/documentProfesor.model.js";
import { DocumentIE } from "../models/documentIE.model.js";
/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de visitar la página de documentos de gestión
export const getDocuments = async (req, res) => {
  const user = req.session;
  const ie = user.user.name;
  const institutions = await Institution.getInstitution();
  try {
    const schoolYear = await SchoolYear.getSchoolYear();
    const anios = [];
    for (let i = 0; i < schoolYear.length; i++) {
      const element = schoolYear[i];
      const objet = {
        idAnio: element.idAnio,
        nombreAnio: element.nombreAnio,
        ie,
      };
      anios.push(objet);
    }
    const documents = await DocumentIE.getDocument(ie);
    res.render("documents/index", {
      user,
      institutions,
      anios,
      ie,
      documents,
    });
  } catch (error) {
    res.render("documents/index", { user, institutions });
  }
};

// para consultar documentos por IE (solo administrador)
export const getDocumentsByIE = async (req, res) => {
  const user = req.session;
  const institutions = await Institution.getInstitution();
  const { ie } = req.body;
  try {
    const schoolYear = await SchoolYear.getSchoolYear();
    const documents = await DocumentIE.getDocument(ie);
    const [ieDB] = await Institution.getInstitutionById(ie);
    const nameIE = `${ieDB.nombreNivel} - ${ieDB.nombreInstitucion}`;
    const anios = [];
    for (let i = 0; i < schoolYear.length; i++) {
      const element = schoolYear[i];
      const objet = {
        idAnio: element.idAnio,
        nombreAnio: element.nombreAnio,
        ie,
      };
      anios.push(objet);
    }
    res.render("documents/index", {
      user,
      institutions,
      anios,
      ie,
      nameIE,
      documents,
    });
  } catch (error) {
    res.redirect("/documents");
  }
};

/* controla lo que se debe mostrar al momento de visitar la
página de documentos por año, aquí veremos las carpetas
por cada docente */
export const getDocumentByName = async (req, res) => {
  const user = req.session;
  const { anio } = req.params;
  try {
    const str = anio.split("_");
    const year = str[0];
    const ie = str[1];
    const [schoolYear] = await SchoolYear.getSchoolYearByName(year);
    console.log(schoolYear);
    const profesor = await Personal.getPersonal(ie);
    console;
    const fileProfesor = await FileProfesor.getFile(ie, schoolYear.idAnio);
    res.render("documents/indexByAnio", { user, profesor, fileProfesor, anio });
  } catch (error) {
    res.render("documents/indexByAnio", { user });
  }
};

/* controla lo que se debe mostrar al momento de visitar la
página de documentos por año, aquí veremos los documentos
por cada docente */
export const getDocumentByProfesor = async (req, res) => {
  const user = req.session;
  const { idCarpeta } = req.params;
  try {
    const documents = await DocumentProfesor.getDocument(idCarpeta);
    res.render("documents/indexByProfesor", { user, idCarpeta, documents });
  } catch (error) {
    res.render("documents/indexByProfesor", { user, idCarpeta });
  }
};

// para agregar carpetas para los docentes de cada IE
export const fileProfesor = async (req, res) => {
  const user = req.session;
  const ie = user.user.name;
  const { anio } = req.params;
  const { profesor } = req.body;

  try {
    const str = anio.split("_");
    const year = str[0];
    const [schoolYear] = await SchoolYear.getSchoolYearByName(year);
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
      const { mimetype, originalname, filename } = req.file;
      if (mimetype === "application/pdf") {
        savePDF(req.file);
        const resDB = await DocumentProfesor.set(
          idCarpeta,
          originalname,
          filename
        );
        if (resDB.affectedRows > 0) {
          // Si el registro es exitoso
          res.cookie("success", ["¡Registro exitoso!"], {
            httpOnly: true,
            maxAge: 6000,
          }); // 6 segundos
          res.redirect(`/documents/file/${idCarpeta}`);
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
    console.log(error.message);
    res.redirect(`/documents/file/${idCarpeta}`);
  }
};

// para agregar documentos para cada IE (documentos de gestión interna)
export const documentIE = async (req, res) => {
  const { idIE } = req.params;
  try {
    if (req.file) {
      const { mimetype, originalname, filename } = req.file;
      if (mimetype === "application/pdf") {
        savePDF(req.file);
        const resDB = await DocumentIE.set(idIE, originalname, filename);
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

// para ver los pdf desde la vista
export const viewPDF = async (req, res) => {
  const { archive } = req.params;
  try {
    const namePDF = archive + ".pdf";
    // para establecer la ruta hasta la carpeta "src"
    const _filename = fileURLToPath(import.meta.url);
    const _dirname = path.dirname(_filename);
    const rutaPDF = path.resolve(_dirname, '..', 'documents', namePDF);
    //const rutaPDF = path.join(__dirname, "documents", namePDF);

    res.sendFile(rutaPDF);
  } catch (error) {
  }
};

// función para que el pdf subido se guarde con su nombre original dentro de la carpeta "src/public/documents"
const savePDF = (file) => {
  const newPath = `./src/documents/${file.filename}.pdf`;
  fs.renameSync(file.path, newPath);
  return newPath;
};
