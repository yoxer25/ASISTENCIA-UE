import { Personal } from "../models/personal.model.js";
import { Specialist } from "../models/specialist.model.js";

// controla lo que se debe ver al visitar la página de áreas
export const getSpecialist = async (req, res) => {
  const user = req.session;
  const ie = user.user.name;
  const personal = await Personal.getPersonal(ie);
  try {
    const specialists = await Specialist.getSpecialists();
    res.render("specialist/index", { user, personal, specialists });
  } catch (error) {
    res.render("specialist/index", { user, personal });
  }
};

// controla lo que se debe ver la página de áreas de editar
export const getById = async (req, res) => {
  const user = req.session;
  const ie = user.user.name;
  const { idSpecialist } = req.params;
  const personal = await Personal.getPersonal(ie);
  try {
    const [specialist] = await Specialist.getSpecialistById(idSpecialist);
    const specialists = await Specialist.getSpecialists();
    res.render("specialist/update", {
      user,
      personal,
      specialists,
      specialist,
    });
  } catch (error) {
    res.render("specialist/update", { user, personal });
  }
};

// controla lo que se debe ver al visitar la página de áreas
export const set = async (req, res) => {
  const { nameSpecialty, designatedPerson, _method } = req.body;
  const { idSpecialist } = req.params;
  try {
    if (_method) {
      validationInput(nameSpecialty, designatedPerson, res);
      const resDB = await Specialist.set(
        idSpecialist,
        designatedPerson,
        nameSpecialty,
        _method
      );
      if (resDB.affectedRows > 0) {
        // Si el registro es exitoso
        res.cookie("success", ["Actualización exitosa!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        res.redirect("/specialists");
      } else {
        // Si el registro falla
        res.cookie("error", ["¡Error al actualizar registro!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Error al actualizar registro");
      }
    } else {
      validationInput(nameSpecialty, designatedPerson, res);
      const resDB = await Specialist.create(designatedPerson, nameSpecialty);
      if (resDB.affectedRows > 0) {
        // Si el registro es exitoso
        res.cookie("success", ["¡Registro exitoso!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        res.redirect("/specialists");
      } else {
        // Si el registro falla
        res.cookie("error", ["¡Error al agregar registro!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Error al agregar registro");
      }
    }
  } catch (error) {
    res.redirect("/specialists");
  }
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar productos
const validationInput = (nameSpecialty, designatedPerson, res) => {
  if (nameSpecialty === "" || designatedPerson === "") {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("Todos los campos son obligatorios");
  }
};
