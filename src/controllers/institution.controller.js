import { Institution } from "../models/institution.model.js";
import { District } from "../models/district.model.js";
import { EducationalLevel } from "../models/educationalLevel.model.js";
import { TurnInstitution } from "../models/turnInstitution.model.js";
import { ScheduleInstitution } from "../models/scheduleInstitution.model.js";

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
    const turnInstitution = await TurnInstitution.getTurnInstitution();
    const scheduleInstitution =
      await ScheduleInstitution.getScheduleInstitution();
    res.render("institution/create", {
      user,
      district,
      educationalLevel,
      turnInstitution,
      scheduleInstitution,
    });
  } catch (error) {
    res.render("institution/create", { user });
  }
};

/* para guardar en la DB los datos de la IE,
si la ruta tiene el id de la I.E como parámetro,
se actualizará los datos de dicha I.E; caso contrario
se crea una nueva I.E. En ambos casos se consulta a
la db, si el código modular no existe, se guarda y
redirecciona al listado de IIEE, caso contrario se
redirecciona a la pestaña de crear y/o actualizar IE */
export const set = async (req, res) => {
  const {
    modularCode,
    district,
    nameInstitution,
    level,
    nameDirector,
    address,
    turnInstitution,
    scheduleInstitution,
    _method,
  } = req.body;

  const { Id } = req.params;
  try {
    validationInput(
      modularCode,
      district,
      nameInstitution,
      level,
      nameDirector,
      address,
      turnInstitution,
      scheduleInstitution
    );
    const [resModularCodeDB] = await Institution.getInstitutionById(
      modularCode
    );
    if (_method) {
      if (resModularCodeDB) {
        if (resModularCodeDB.idInstitucion === Id) {
          const resDb = await Institution.set(
            modularCode,
            district,
            level,
            nameInstitution,
            nameDirector,
            address,
            turnInstitution,
            scheduleInstitution,
            Id,
            _method
          );
          if (resDb.affectedRows > 0) {
            res.redirect("/institutions/page1");
          } else {
            throw new Error("Error al agregar registro");
          }
        } else {
          throw new Error("Registro ya existe");
        }
      } else {
        const resDb = await Institution.set(
          modularCode,
          district,
          level,
          nameInstitution,
          nameDirector,
          address,
          turnInstitution,
          scheduleInstitution,
          Id,
          _method
        );
        if (resDb.affectedRows > 0) {
          res.redirect("/institutions/page1");
        } else {
          throw new Error("Error al agregar registro");
        }
      }
    } else {
      if (resModularCodeDB === undefined) {
        const resDb = await Institution.set(
          modularCode,
          district,
          level,
          nameInstitution,
          nameDirector,
          address,
          turnInstitution,
          scheduleInstitution
        );
        if (resDb.affectedRows > 0) {
          res.redirect("/institutions/page1");
        } else {
          throw new Error("Error al agregar registro");
        }
      } else {
        throw new Error("Registro ya existe");
      }
    }
  } catch (error) {
    res.redirect("/institutions/create");
  }
};

// para buscar I.E por nombre
export const search = async (req, res) => {
  const user = req.session;
  try {
    const { ie } = req.body;
    if (ie) {
      const institutions = await Institution.getInstitutionByName(ie);
      res.render("institution/index", {
        user,
        institutions,
      });
    } else {
      res.redirect("/institutions/page1");
    }
  } catch (error) {
    res.render("institution/index", { user });
  }
};

// para buscar I.E por ID
export const getById = async (req, res) => {
  const user = req.session;
  try {
    const { Id } = req.params;
    const [institution] = await Institution.getInstitutionById(Id);
    const district = await District.getSelectDistrict(Id);
    const educationalLevel = await EducationalLevel.getSelectEducationalLevel(
      Id
    );
    const turnInstitution = await TurnInstitution.getSelectTurnInstitution(Id);
    const scheduleInstitution =
      await ScheduleInstitution.getSelectScheduleInstitution(Id);
    res.render("institution/update", {
      user,
      institution,
      district,
      educationalLevel,
      turnInstitution,
      scheduleInstitution,
    });
  } catch (error) {
    res.redirect("/institutions/page1");
  }
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar II.EE
function validationInput(
  modularCode,
  district,
  nameInstitution,
  level,
  nameDirector,
  address,
  turnInstitution,
  scheduleInstitution
) {
  if (
    modularCode === "" ||
    district === "" ||
    nameInstitution === "" ||
    level === "" ||
    nameDirector === "" ||
    address === "" ||
    turnInstitution === "" ||
    scheduleInstitution === ""
  )
    throw new Error("Todos los campos son obligatorios");
}
