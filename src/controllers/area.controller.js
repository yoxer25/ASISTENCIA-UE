import { Area } from "../models/area.model.js";
import { Personal } from "../models/personal.model.js";

// controla lo que se debe ver al visitar la página de áreas
export const getArea = async (req, res) => {
  const user = req.session;
  const ie = user.user.name;
  const personal = await Personal.getPersonal(ie);
  try {
    const areas = await Area.getAreas();
    res.render("area/index", { user, personal, areas });
  } catch (error) {
    res.render("area/index", { user, personal });
  }
};

// controla lo que se debe ver la página de áreas de editar
export const getAreaById = async (req, res) => {
  const user = req.session;
  const ie = user.user.name;
  const { idArea } = req.params;
  const personal = await Personal.getPersonal(ie);
  try {
    const [area] = await Area.getAreaById(idArea);
    const areas = await Area.getAreas();
    res.render("area/update", { user, personal, areas, area });
  } catch (error) {
    res.render("area/update", { user, personal });
  }
};

// controla lo que se debe ver al visitar la página de áreas
export const setArea = async (req, res) => {
  const user = req.session;
  const { nameArea, designatedPerson, _method } = req.body;
  const { idArea } = req.params;
  try {
    if (_method) {
      validationInput(nameArea, designatedPerson, res);
      const resDB = await Area.set(idArea, nameArea, designatedPerson, _method);
      if (resDB.affectedRows > 0) {
        // Si el registro es exitoso
        res.cookie("success", ["Actualización exitosa!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        res.redirect("/areas");
      } else {
        // Si el registro falla
        res.cookie("error", ["¡Error al actualizar registro!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        throw new Error("Error al actualizar registro");
      }
    } else {
      validationInput(nameArea, designatedPerson, res);
      const resDB = await Area.create(nameArea, designatedPerson);
      if (resDB.affectedRows > 0) {
        // Si el registro es exitoso
        res.cookie("success", ["¡Registro exitoso!"], {
          httpOnly: true,
          maxAge: 6000,
        }); // 6 segundos
        res.redirect("/areas");
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
    console.log(error.message);
    res.redirect("/areas");
  }
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar productos
const validationInput = (nameArea, designatedPerson, res) => {
  if (nameArea === "" || designatedPerson === "") {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("Todos los campos son obligatorios");
  }
};
