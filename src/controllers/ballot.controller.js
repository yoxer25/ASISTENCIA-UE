import { Area } from "../models/area.model.js";
import { Ballot } from "../models/ballot.model.js";
import { Correlative } from "../models/Correlative.model.js";
import { Personal } from "../models/personal.model.js";
/* exportamos todas las funciones para poder llamarlas desde
la carpeta "routes" que tienen todas las rutas de la web */

// controla lo que se debe mostrar al momento de vistar la página de papeletas
export const getBallot = async (req, res) => {
  const user = req.session;
  const dni = user.user.dniUser;
  try {
    let ballots = [];
    const [personal] = await Personal.getPersonalByDNI(dni); // datos de quien ha iniciado sesión
    const [jefeArea] = await Area.getAreaByResponsable(personal.idPersonal);
    let area = 0;
    if (jefeArea) {
      area = jefeArea.idArea;
      if (jefeArea.idArea === 2 || jefeArea.idArea === 6) {
        ballots = await Ballot.getBallots();
      } else {
        ballots = await Ballot.getBallots(null, jefeArea.idArea);
      }
    } else {
      ballots = await Ballot.getBallots(personal.idPersonal);
    }
    res.render("ballot/ballot", {
      user,
      personal,
      ballots,
      area,
    });
  } catch (error) {
    res.render("ballot/ballot", { user });
  }
};

// para registrar una papeleta
export const createBallot = async (req, res) => {
  const { applicant, dependency, workingCondition, reason, foundation } =
    req.body;
  let { startDate, endDate, startTime, endTime } = req.body;
  startDate = startDate || null;
  endDate = endDate || null;
  startTime = startTime || null;
  endTime = endTime || null;
  try {
    validationInput(
      applicant,
      dependency,
      workingCondition,
      reason,
      foundation,
      res
    );
    const correlative = await generateCorrelativo();
    const resDB = await Ballot.create(
      correlative,
      applicant,
      dependency,
      workingCondition,
      reason,
      foundation,
      startDate,
      endDate,
      startTime,
      endTime
    );
    if (resDB.affectedRows > 0) {
      await updateCorrelativo();
      // Si el registro es exitoso
      res.cookie("success", ["¡Registro exitoso!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      res.redirect("/ballots");
    } else {
      // Si el registro falla
      res.cookie("error", ["¡Error al agregar registro!"], {
        httpOnly: true,
        maxAge: 6000,
      }); // 6 segundos
      throw new Error("Error al agregar registro");
    }
  } catch (error) {
    res.redirect("/ballots");
  }
};

// para aprobar papeletas
export const approve = async (req, res) => {
  const user = req.session;
  const dni = user.user.dniUser;
  const { id } = req.params;
  try {
    const [personal] = await Personal.getPersonalByDNI(dni); // datos de quien ha iniciado sesión
    const [jefeArea] = await Area.getAreaByResponsable(personal.idPersonal);
    const [ballot] = await Ballot.getBallotById(id);
    await Ballot.update(id, jefeArea.idArea, ballot.idArea);
    res.redirect("/ballots");
  } catch (error) {
    // Si el registro falla
    res.cookie("error", ["¡Error al aprobar papeleta!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    res.redirect("/ballots");
  }
};

// Función para obtener y actualizar el correlativo
const generateCorrelativo = async () => {
  // Primero obtenemos el último correlativo
  const [results] = await Correlative.getCorrelative();
  let nuevoCorrelativo = results.ultimaPapeleta + 1; // Incrementamos el correlativo

  // Formateamos el correlativo con ceros a la izquierda
  const formattedCorrelativo = `${String(nuevoCorrelativo).padStart(6, "0")}`;

  return formattedCorrelativo; // Devolvemos el correlativo formateado
};

// Función para obtener y actualizar el correlativo
const updateCorrelativo = async () => {
  // Primero obtenemos el último correlativo
  const [results] = await Correlative.getCorrelative();
  let nuevoCorrelativo = results.ultimaPapeleta + 1; // Incrementamos el correlativo
  // Actualizamos el correlativo en la base de datos
  await Correlative.updateCorrelative(nuevoCorrelativo);
};

// función para validar que el usuario llene completamente el formulario de crear y actualizar productos
const validationInput = (
  applicant,
  dependency,
  workingCondition,
  reason,
  foundation,
  res
) => {
  if (
    applicant === "" ||
    dependency === "" ||
    workingCondition === "" ||
    reason === "" ||
    foundation === ""
  ) {
    res.cookie("error", ["¡Todos los campos son obligatorios!"], {
      httpOnly: true,
      maxAge: 6000,
    }); // 6 segundos
    throw new Error("Todos los campos son obligatorios");
  }
};
